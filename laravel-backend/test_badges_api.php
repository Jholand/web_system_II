<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$user = \App\Models\User::find(1);

$earnedBadges = \App\Models\UserBadge::where('user_id', $user->id)
    ->where('is_earned', true)
    ->with(['badge' => function ($query) {
        $query->select([
            'id', 'name', 'slug', 'description', 'icon', 'color',
            'requirement_type', 'requirement_value', 'points_reward', 'rarity'
        ])->with('category:category_id,category_name,icon');
    }])
    ->orderBy('earned_at', 'desc')
    ->get();

echo "Earned badges count: " . $earnedBadges->count() . PHP_EOL;
echo "First 3 earned badges:" . PHP_EOL;
echo json_encode($earnedBadges->take(3)->toArray(), JSON_PRETTY_PRINT);
