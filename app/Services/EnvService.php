<?php

namespace App\Services;

use Illuminate\Support\Facades\File;

class EnvService
{
    /**
     * Path to the .env file
     * 
     * @var string
     */
    protected $envPath;

    /**
     * EnvService constructor.
     */
    public function __construct()
    {
        $this->envPath = base_path('.env');
    }

    /**
     * Get all environment variables.
     *
     * @return array
     */
    public function getAll(): array
    {
        $content = File::get($this->envPath);
        
        $env = [];
        foreach (explode("\n", $content) as $line) {
            $line = trim($line);
            
            // Skip comments and empty lines
            if (empty($line) || str_starts_with($line, '#')) {
                continue;
            }
            
            // Parse key=value pair
            if (str_contains($line, '=')) {
                list($key, $value) = explode('=', $line, 2);
                $key = trim($key);
                $value = trim($value);
                
                // Remove quotes if present
                if (str_starts_with($value, '"') && str_ends_with($value, '"')) {
                    $value = substr($value, 1, -1);
                }
                
                $env[$key] = $value;
            }
        }
        
        return $env;
    }

    /**
     * Get specific environment variables by keys.
     *
     * @param array $keys
     * @return array
     */
    public function get(array $keys): array
    {
        $env = $this->getAll();
        
        return array_filter($env, function ($key) use ($keys) {
            return in_array($key, $keys);
        }, ARRAY_FILTER_USE_KEY);
    }

    /**
     * Set environment variables.
     *
     * @param array $data
     * @return bool
     */
    public function set(array $data): bool
    {
        if (empty($data)) {
            return false;
        }
        
        $content = File::get($this->envPath);
        
        foreach ($data as $key => $value) {
            // Prepare the value with quotes if needed
            if (str_contains($value, ' ') || empty($value)) {
                $value = '"' . $value . '"';
            }
            
            // Check if the key already exists
            $pattern = "/^{$key}=.*/m";
            if (preg_match($pattern, $content)) {
                // Update existing key
                $content = preg_replace($pattern, "{$key}={$value}", $content);
            } else {
                // Add new key at the end
                $content .= "\n{$key}={$value}";
            }
        }
        
        return File::put($this->envPath, $content) !== false;
    }
} 