<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $csvData = [
            [
                'name' => 'Firoz Anam',
                'email' => 'firozanam.bd@gmail.com',
                'isAdmin' => true,
            ],
            [
                'name' => 'Test User',
                'email' => 'firozanam.pub@gmail.com',
                'isAdmin' => false,
            ],
            [
                'name' => 'Sohag Patowary',
                'email' => 'magaasiashop@gmail.com',
                'isAdmin' => true,
            ],
        ];

        foreach ($csvData as $userData) {
            User::create([
                'name' => $userData['name'],
                'email' => $userData['email'],
                'password' => Hash::make('Password@1234'),
                'role' => $userData['isAdmin'] ? 'admin' : 'user',
            ]);
        }
    }
} 