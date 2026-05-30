<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('provinces', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('cities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('province_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->decimal('delivery_fee', 10, 2)->default(0);
            $table->boolean('is_local')->default(false);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        // Add city_id to addresses table
        Schema::table('addresses', function (Blueprint $table) {
            $table->foreignId('city_id')->nullable()->after('user_id')->constrained()->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('addresses', function (Blueprint $table) {
            $table->dropForeign(['city_id']);
            $table->dropColumn('city_id');
        });
        Schema::dropIfExists('cities');
        Schema::dropIfExists('provinces');
    }
};
