<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Schedule to handle expired redemptions every hour
Schedule::command('redemptions:handle-expired')
    ->hourly()
    ->withoutOverlapping()
    ->runInBackground();
