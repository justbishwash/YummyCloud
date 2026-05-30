<?php

namespace Database\Seeders;

use App\Models\Province;
use App\Models\City;
use Illuminate\Database\Seeder;

class LocationSeeder extends Seeder
{
    public function run(): void
    {
        $data = [
            'Province 1 (Koshi)' => [
                ['name' => 'Biratnagar', 'is_local' => true, 'delivery_fee' => 0],
                ['name' => 'Dharan', 'delivery_fee' => 100],
                ['name' => 'Itahari', 'delivery_fee' => 80],
                ['name' => 'Damak', 'delivery_fee' => 150],
                ['name' => 'Birtamod', 'delivery_fee' => 200],
                ['name' => 'Inaruwa', 'delivery_fee' => 120],
            ],
            'Province 2 (Madhesh)' => [
                ['name' => 'Janakpur', 'delivery_fee' => 250],
                ['name' => 'Birgunj', 'delivery_fee' => 300],
                ['name' => 'Rajbiraj', 'delivery_fee' => 200],
            ],
            'Bagmati Province' => [
                ['name' => 'Kathmandu', 'delivery_fee' => 350],
                ['name' => 'Lalitpur', 'delivery_fee' => 350],
                ['name' => 'Bhaktapur', 'delivery_fee' => 350],
                ['name' => 'Hetauda', 'delivery_fee' => 300],
            ],
            'Gandaki Province' => [
                ['name' => 'Pokhara', 'delivery_fee' => 400],
            ],
            'Lumbini Province' => [
                ['name' => 'Butwal', 'delivery_fee' => 350],
                ['name' => 'Bhairahawa', 'delivery_fee' => 350],
                ['name' => 'Nepalgunj', 'delivery_fee' => 400],
            ],
            'Karnali Province' => [
                ['name' => 'Surkhet', 'delivery_fee' => 450],
            ],
            'Sudurpashchim Province' => [
                ['name' => 'Dhangadhi', 'delivery_fee' => 450],
                ['name' => 'Mahendranagar', 'delivery_fee' => 500],
            ],
        ];

        $order = 1;
        foreach ($data as $provinceName => $cities) {
            $province = Province::firstOrCreate(['name' => $provinceName], ['sort_order' => $order++]);
            $cityOrder = 1;
            foreach ($cities as $city) {
                City::firstOrCreate(
                    ['province_id' => $province->id, 'name' => $city['name']],
                    ['delivery_fee' => $city['delivery_fee'] ?? 0, 'is_local' => $city['is_local'] ?? false, 'sort_order' => $cityOrder++]
                );
            }
        }
    }
}
