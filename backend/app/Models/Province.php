<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Province extends Model
{
    protected $fillable = ['name', 'sort_order'];

    public function cities()
    {
        return $this->hasMany(City::class)->orderBy('sort_order');
    }
}
