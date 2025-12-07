<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\UserCheckin;
use App\Models\UserPointsTransaction;
use App\Models\Destination;
use App\Models\Badge;
use App\Models\UserBadge;
use App\Models\Reward;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;

class AdminDashboardController extends Controller
{
    /**
     * Get dashboard statistics with time period filter
     */
    public function index(Request $request)
    {
        $period = $request->get('period', 'daily'); // daily, monthly, yearly, all
        
        // Cache all dashboard data for 30 minutes regardless of period
        $cacheKey = "admin_dashboard_all";
        
        $allData = Cache::remember($cacheKey, 1800, function() {
            // Period-independent data (computed once)
            $commonData = [
                'overview' => $this->getOverviewStats(),
                'rewards_distribution' => $this->getRewardsDistribution(),
                'quick_stats' => $this->getQuickStats(),
                'recent_activities' => $this->getRecentActivities(),
                'top_destinations' => $this->getTopDestinations(),
            ];
            
            return [
                'daily' => array_merge($commonData, [
                    'chart_data' => $this->getChartData('daily'),
                ]),
                'monthly' => array_merge($commonData, [
                    'chart_data' => $this->getChartData('monthly'),
                ]),
                'yearly' => array_merge($commonData, [
                    'chart_data' => $this->getChartData('yearly'),
                ]),
            ];
        });
        
        // Return all data if requested, otherwise specific period
        if ($period === 'all') {
            return response()->json([
                'success' => true,
                'data' => $allData
            ]);
        }
        
        // Return only the requested period's data
        return response()->json([
            'success' => true,
            'data' => $allData[$period] ?? $allData['daily']
        ]);
    }
    
    /**
     * Get overview statistics - optimized with raw queries
     */
    private function getOverviewStats()
    {
        $currentMonth = Carbon::now()->startOfMonth();
        $lastMonth = Carbon::now()->subMonth()->startOfMonth();
        
        // Use raw DB queries for maximum speed
        $totalUsers = DB::table('users')->where('role_id', 2)->count();
        $lastMonthUsers = DB::table('users')
            ->where('role_id', 2)
            ->where('created_at', '<', $currentMonth)
            ->count();
        $userGrowth = $lastMonthUsers > 0 
            ? round((($totalUsers - $lastMonthUsers) / $lastMonthUsers) * 100, 1)
            : 0;
        
        // Total check-ins - use indexed column
        $totalCheckins = DB::table('user_checkins')->count('id');
        $lastMonthCheckins = DB::table('user_checkins')
            ->where('checked_in_at', '<', $currentMonth)
            ->count();
        $checkinGrowth = $lastMonthCheckins > 0 
            ? round((($totalCheckins - $lastMonthCheckins) / $lastMonthCheckins) * 100, 1)
            : 0;
        
        // Total points - direct column sum
        $totalPoints = DB::table('users')->sum('total_points');
        
        // Points growth - optimized with indexed transaction_date and transaction_type
        $pointsThisMonth = DB::table('user_points_transactions')
            ->where('transaction_type', 'earned')
            ->where('transaction_date', '>=', $currentMonth)
            ->sum('points');
        $pointsLastMonth = DB::table('user_points_transactions')
            ->where('transaction_type', 'earned')
            ->whereBetween('transaction_date', [$lastMonth, $currentMonth])
            ->sum('points');
        $pointsGrowth = $pointsLastMonth > 0 
            ? round((($pointsThisMonth - $pointsLastMonth) / $pointsLastMonth) * 100, 1)
            : 0;
        
        // Rewards claimed - indexed queries
        $rewardsClaimed = DB::table('user_points_transactions')
            ->where('transaction_type', 'redeemed')
            ->count();
        $rewardsThisMonth = DB::table('user_points_transactions')
            ->where('transaction_type', 'redeemed')
            ->where('transaction_date', '>=', $currentMonth)
            ->count();
        $rewardsLastMonth = DB::table('user_points_transactions')
            ->where('transaction_type', 'redeemed')
            ->whereBetween('transaction_date', [$lastMonth, $currentMonth])
            ->count();
        $rewardsGrowth = $rewardsLastMonth > 0 
            ? round((($rewardsThisMonth - $rewardsLastMonth) / $rewardsLastMonth) * 100, 1)
            : 0;
        
        // Total destinations, badges, and rewards
        $totalDestinations = DB::table('destinations')->where('status', 'active')->count();
        $totalBadges = DB::table('badges')->count();
        $totalRewards = DB::table('rewards')->count();
        
        return [
            'total_users' => number_format($totalUsers),
            'users_growth' => $userGrowth,
            'total_checkins' => number_format($totalCheckins),
            'checkins_growth' => $checkinGrowth,
            'total_points' => number_format($totalPoints),
            'points_growth' => $pointsGrowth,
            'rewards_claimed' => number_format($rewardsClaimed),
            'rewards_growth' => $rewardsGrowth,
            'total_destinations' => number_format($totalDestinations),
            'total_badges' => number_format($totalBadges),
            'total_rewards' => number_format($totalRewards),
        ];
    }
    
    /**
     * Get chart data based on period
     */
    private function getChartData($period)
    {
        switch ($period) {
            case 'daily':
                return $this->getDailyData();
            case 'monthly':
                return $this->getMonthlyData();
            case 'yearly':
                return $this->getYearlyData();
            default:
                return $this->getDailyData();
        }
    }
    
    /**
     * Get daily data for current month - optimized
     */
    private function getDailyData()
    {
        $currentMonth = Carbon::now();
        $startOfMonth = $currentMonth->copy()->startOfMonth();
        $endOfMonth = $currentMonth->copy()->endOfMonth();
        $daysInMonth = $currentMonth->daysInMonth;
        
        // Use single query with grouping for all days at once
        $checkinsData = DB::table('user_checkins')
            ->selectRaw('DAY(checked_in_at) as day, COUNT(*) as count')
            ->whereBetween('checked_in_at', [$startOfMonth, $endOfMonth])
            ->groupBy(DB::raw('DAY(checked_in_at)'))
            ->pluck('count', 'day')
            ->toArray();
        
        $pointsData = DB::table('user_points_transactions')
            ->selectRaw('DAY(transaction_date) as day, SUM(points) as total')
            ->where('transaction_type', 'earned')
            ->whereBetween('transaction_date', [$startOfMonth, $endOfMonth])
            ->groupBy(DB::raw('DAY(transaction_date)'))
            ->pluck('total', 'day')
            ->toArray();
        
        $labels = [];
        $checkins = [];
        $points = [];
        
        for ($day = 1; $day <= $daysInMonth; $day++) {
            $labels[] = $day;
            $checkins[] = (int)($checkinsData[$day] ?? 0);
            $points[] = (int)($pointsData[$day] ?? 0);
        }
        
        return [
            'period' => 'daily',
            'period_label' => $currentMonth->format('F Y'),
            'labels' => $labels,
            'checkins' => $checkins,
            'points' => $points,
        ];
    }
    
    /**
     * Get monthly data for current year - optimized
     */
    private function getMonthlyData()
    {
        $currentYear = Carbon::now()->year;
        $startOfYear = Carbon::create($currentYear, 1, 1)->startOfYear();
        $endOfYear = Carbon::create($currentYear, 12, 31)->endOfYear();
        
        $labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        // Single query with grouping by month
        $checkinsData = DB::table('user_checkins')
            ->selectRaw('MONTH(checked_in_at) as month, COUNT(*) as count')
            ->whereBetween('checked_in_at', [$startOfYear, $endOfYear])
            ->groupBy(DB::raw('MONTH(checked_in_at)'))
            ->pluck('count', 'month')
            ->toArray();
        
        $pointsData = DB::table('user_points_transactions')
            ->selectRaw('MONTH(transaction_date) as month, SUM(points) as total')
            ->where('transaction_type', 'earned')
            ->whereBetween('transaction_date', [$startOfYear, $endOfYear])
            ->groupBy(DB::raw('MONTH(transaction_date)'))
            ->pluck('total', 'month')
            ->toArray();
        
        $checkins = [];
        $points = [];
        
        for ($month = 1; $month <= 12; $month++) {
            $checkins[] = (int)($checkinsData[$month] ?? 0);
            $points[] = (int)($pointsData[$month] ?? 0);
        }
        
        return [
            'period' => 'monthly',
            'period_label' => (string)$currentYear,
            'labels' => $labels,
            'checkins' => $checkins,
            'points' => $points,
        ];
    }
    
    /**
     * Get yearly data from 2023 to current year - optimized
     */
    private function getYearlyData()
    {
        $currentYear = Carbon::now()->year;
        $startYear = 2023;
        
        // Single query with grouping by year
        $checkinsData = DB::table('user_checkins')
            ->selectRaw('YEAR(checked_in_at) as year, COUNT(*) as count')
            ->whereYear('checked_in_at', '>=', $startYear)
            ->groupBy(DB::raw('YEAR(checked_in_at)'))
            ->pluck('count', 'year')
            ->toArray();
        
        $pointsData = DB::table('user_points_transactions')
            ->selectRaw('YEAR(transaction_date) as year, SUM(points) as total')
            ->where('transaction_type', 'earned')
            ->whereYear('transaction_date', '>=', $startYear)
            ->groupBy(DB::raw('YEAR(transaction_date)'))
            ->pluck('total', 'year')
            ->toArray();
        
        $labels = [];
        $checkins = [];
        $points = [];
        
        for ($year = $startYear; $year <= $currentYear; $year++) {
            $labels[] = (string)$year;
            $checkins[] = (int)($checkinsData[$year] ?? 0);
            $points[] = (int)($pointsData[$year] ?? 0);
        }
        
        return [
            'period' => 'yearly',
            'period_label' => "$startYear - $currentYear",
            'labels' => $labels,
            'checkins' => $checkins,
            'points' => $points,
        ];
    }
    
    /**
     * Get recent activities - optimized with specific columns
     */
    private function getRecentActivities()
    {
        return DB::table('user_checkins')
            ->join('users', 'user_checkins.user_id', '=', 'users.id')
            ->join('destinations', 'user_checkins.destination_id', '=', 'destinations.destination_id')
            ->select(
                'user_checkins.id',
                'users.first_name',
                'users.last_name',
                'destinations.name as destination_name',
                'user_checkins.points_earned',
                'user_checkins.checked_in_at'
            )
            ->orderBy('user_checkins.checked_in_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function($checkin) {
                return [
                    'id' => $checkin->id,
                    'user_name' => $checkin->first_name . ' ' . $checkin->last_name,
                    'destination_name' => $checkin->destination_name,
                    'points_earned' => $checkin->points_earned,
                    'checked_in_at' => Carbon::parse($checkin->checked_in_at)->diffForHumans(),
                ];
            });
    }
    
    /**
     * Get top destinations by visits - optimized with raw query
     */
    private function getTopDestinations()
    {
        return DB::table('destinations')
            ->select('destination_id', 'name', 'total_visits')
            ->where('status', 'active')
            ->orderBy('total_visits', 'desc')
            ->limit(5)
            ->get()
            ->map(function($destination) {
                return [
                    'id' => $destination->destination_id,
                    'name' => $destination->name,
                    'visits' => $destination->total_visits,
                ];
            });
    }
    
    /**
     * Get quick stats (today's activity) - optimized
     */
    private function getQuickStats()
    {
        $today = Carbon::today()->toDateString();
        
        return [
            'checkins_today' => DB::table('user_checkins')
                ->whereDate('checked_in_at', $today)
                ->count(),
            'badges_earned_today' => DB::table('user_badges')
                ->whereDate('earned_at', $today)
                ->count(),
        ];
    }
    
    /**
     * Get rewards distribution data (monthly for current year) - optimized
     */
    private function getRewardsDistribution()
    {
        $currentYear = Carbon::now()->year;
        $startOfYear = Carbon::create($currentYear, 1, 1)->startOfYear();
        $endOfYear = Carbon::create($currentYear, 12, 31)->endOfYear();
        
        $labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        // Single query with grouping
        $rewardsData = DB::table('user_points_transactions')
            ->selectRaw('MONTH(transaction_date) as month, COUNT(*) as count')
            ->where('transaction_type', 'redeemed')
            ->whereBetween('transaction_date', [$startOfYear, $endOfYear])
            ->groupBy(DB::raw('MONTH(transaction_date)'))
            ->pluck('count', 'month')
            ->toArray();
        
        $data = [];
        for ($month = 1; $month <= 12; $month++) {
            $data[] = (int)($rewardsData[$month] ?? 0);
        }
        
        return [
            'labels' => $labels,
            'data' => $data,
        ];
    }
}
