<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Laravel Storage Symlink Creator</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
            color: #333;
        }

        .container {
            max-width: 900px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            animation: slideIn 0.8s ease-out;
        }

        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .header {
            background: linear-gradient(135deg, #ff2d20 0%, #ff6b35 100%);
            padding: 30px;
            text-align: center;
            color: white;
            position: relative;
            overflow: hidden;
        }

        .header::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: repeating-linear-gradient(
                45deg,
                transparent,
                transparent 10px,
                rgba(255, 255, 255, 0.05) 10px,
                rgba(255, 255, 255, 0.05) 20px
            );
            animation: shine 20s linear infinite;
        }

        @keyframes shine {
            0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
            100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
        }

        .logo {
            width: 80px;
            height: 60px;
            margin: 0 auto 20px;
            filter: brightness(0) invert(1);
        }

        @keyframes bounce {
            0%, 20%, 50%, 80%, 100% {
                transform: translateY(0);
            }
            40% {
                transform: translateY(-10px);
            }
            60% {
                transform: translateY(-5px);
            }
        }

        .header h1 {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 10px;
            position: relative;
            z-index: 1;
        }

        .header p {
            font-size: 1.1rem;
            opacity: 0.9;
            position: relative;
            z-index: 1;
        }

        .content {
            padding: 40px;
        }

        .status-section {
            margin-bottom: 30px;
        }

        .status-card {
            background: #f8f9fa;
            border-radius: 12px;
            padding: 25px;
            border-left: 5px solid #28a745;
            margin-bottom: 20px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .status-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
        }

        .status-card.error {
            border-left-color: #dc3545;
            background: #fff5f5;
        }

        .status-card.warning {
            border-left-color: #ffc107;
            background: #fffbf0;
        }

        .status-icon {
            display: inline-block;
            width: 24px;
            height: 24px;
            margin-right: 10px;
            vertical-align: middle;
        }

        .success { color: #28a745; }
        .error { color: #dc3545; }
        .warning { color: #ffc107; }
        .info { color: #17a2b8; }

        .output-section {
            background: #1e1e1e;
            color: #e6e6e6;
            border-radius: 12px;
            padding: 25px;
            margin: 20px 0;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            line-height: 1.6;
            max-height: 400px;
            overflow-y: auto;
            box-shadow: inset 0 4px 8px rgba(0, 0, 0, 0.3);
        }

        .output-section::-webkit-scrollbar {
            width: 8px;
        }

        .output-section::-webkit-scrollbar-track {
            background: #2a2a2a;
            border-radius: 4px;
        }

        .output-section::-webkit-scrollbar-thumb {
            background: #555;
            border-radius: 4px;
        }

        .output-section::-webkit-scrollbar-thumb:hover {
            background: #777;
        }

        .actions {
            display: flex;
            gap: 15px;
            justify-content: center;
            margin-top: 30px;
            flex-wrap: wrap;
        }

        .btn {
            padding: 12px 30px;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            transition: all 0.3s ease;
            text-align: center;
            min-width: 150px;
            justify-content: center;
        }

        .btn-primary {
            background: linear-gradient(135deg, #ff2d20 0%, #ff6b35 100%);
            color: white;
        }

        .btn-primary:hover {
            background: linear-gradient(135deg, #e02417 0%, #e55a2e 100%);
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(255, 45, 32, 0.3);
        }

        .btn-secondary {
            background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%);
            color: white;
        }

        .btn-secondary:hover {
            background: linear-gradient(135deg, #5a6268 0%, #495057 100%);
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(108, 117, 125, 0.3);
        }

        .btn-success {
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
            color: white;
        }

        .btn-success:hover {
            background: linear-gradient(135deg, #218838 0%, #1fa682 100%);
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(40, 167, 69, 0.3);
        }

        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin: 20px 0;
        }

        .info-item {
            background: white;
            border: 2px solid #e9ecef;
            border-radius: 8px;
            padding: 20px;
            transition: border-color 0.3s ease;
        }

        .info-item:hover {
            border-color: #ff2d20;
        }

        .info-label {
            font-weight: 600;
            color: #6c757d;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
        }

        .info-value {
            font-family: 'Courier New', monospace;
            background: #f8f9fa;
            padding: 10px;
            border-radius: 4px;
            word-break: break-all;
            border-left: 3px solid #ff2d20;
        }

        .warning-banner {
            background: linear-gradient(135deg, #ffc107 0%, #ffb300 100%);
            color: #856404;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            font-weight: 600;
            text-align: center;
            animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.02); }
        }

        @media (max-width: 768px) {
            .container {
                margin: 10px;
                border-radius: 15px;
            }
            
            .header h1 {
                font-size: 2rem;
            }
            
            .content {
                padding: 20px;
            }
            
            .actions {
                flex-direction: column;
                align-items: center;
            }
            
            .btn {
                min-width: 200px;
            }
        }

        .loading {
            display: inline-block;
            width: 20px;
            height: 20px;
            border: 3px solid rgba(255,255,255,.3);
            border-radius: 50%;
            border-top-color: #fff;
            animation: spin 1s ease-in-out infinite;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">
                <svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
                    <path fill="currentColor" d="M325.3,243.8v82.5h29.8v14.2h-45.7v-96.7C309.5,243.8,325.3,243.8,325.3,243.8z M411.3,284.8v-8.7h15.1v64.4 h-15.1v-8.7c-2,3.2-4.9,5.8-8.6,7.6c-3.7,1.8-7.5,2.8-11.3,2.8c-4.9,0-9.4-0.9-13.4-2.7c-3.9-1.7-7.5-4.2-10.4-7.4 c-2.9-3.1-5.2-6.8-6.8-10.8c-1.6-4.1-2.5-8.5-2.4-13c0-4.5,0.8-8.8,2.4-12.9c1.6-4,3.9-7.7,6.8-10.8c2.9-3.2,6.5-5.7,10.4-7.4 c4.1-1.8,8.5-2.7,13.4-2.7c3.8,0,7.5,0.9,11.3,2.8S409.3,281.6,411.3,284.8L411.3,284.8z M409.9,316.2c0.9-2.5,1.4-5.2,1.4-7.9 c0-2.8-0.5-5.4-1.4-7.9c-0.9-2.4-2.2-4.6-3.9-6.5c-1.7-1.9-3.7-3.4-6-4.4c-2.3-1.1-5-1.7-7.8-1.7c-2.9,0-5.4,0.6-7.7,1.7 c-2.3,1.1-4.3,2.6-5.9,4.4c-1.7,1.9-3,4.1-3.8,6.5c-0.9,2.5-1.3,5.2-1.3,7.9c0,2.8,0.4,5.4,1.3,7.9c0.9,2.5,2.1,4.7,3.8,6.5 c1.7,1.9,3.7,3.4,5.9,4.4c2.3,1.1,4.9,1.7,7.7,1.7c2.9,0,5.5-0.6,7.8-1.7c2.3-1.1,4.3-2.6,6-4.4C407.7,320.8,409,318.6,409.9,316.2z M438.2,340.5v-64.4h40.9v14.8h-25.8v49.6L438.2,340.5L438.2,340.5z M533.7,284.8v-8.7h15.1v64.4h-15.1v-8.7c-2,3.2-4.9,5.8-8.6,7.6 c-3.7,1.8-7.5,2.8-11.3,2.8c-4.9,0-9.3-0.9-13.4-2.7c-3.9-1.7-7.5-4.2-10.4-7.4c-2.9-3.1-5.2-6.8-6.8-10.8c-1.6-4.1-2.5-8.5-2.4-13 c0-4.5,0.8-8.8,2.4-12.9c1.6-4,3.8-7.7,6.8-10.8c2.9-3.2,6.5-5.7,10.4-7.4c4.1-1.8,8.5-2.7,13.4-2.7c3.8,0,7.5,0.9,11.3,2.8 C528.8,279.1,531.7,281.6,533.7,284.8z M532.3,316.2c0.9-2.5,1.4-5.2,1.4-7.9c0-2.8-0.5-5.4-1.4-7.9c-0.9-2.4-2.2-4.6-3.9-6.5 c-1.7-1.9-3.7-3.4-6-4.4c-2.3-1.1-5-1.7-7.8-1.7c-2.9,0-5.4,0.6-7.7,1.7c-2.3,1.1-4.3,2.6-5.9,4.4c-1.7,1.9-3,4.1-3.8,6.5 c-0.9,2.5-1.3,5.2-1.3,7.9c0,2.8,0.4,5.4,1.3,7.9c0.9,2.5,2.1,4.7,3.8,6.5c1.7,1.9,3.7,3.4,5.9,4.4c2.3,1.1,4.9,1.7,7.7,1.7 c2.9,0,5.5-0.6,7.8-1.7c2.3-1.1,4.3-2.6,6-4.4C530.2,320.8,531.5,318.6,532.3,316.2z M609.2,276.1h15.3l-24.7,64.4h-18.9L556,276.1 h15.3l18.9,49.3L609.2,276.1z M657.3,274.5c20.5,0,34.5,18.2,31.9,39.4h-50c0,5.6,5.6,16.3,18.9,16.3c11.5,0,19.1-10.1,19.1-10.1 l10.2,7.9c-9.1,9.7-16.5,14.2-28.2,14.2c-20.8,0-35-13.2-35-33.9C624.2,289.6,638.8,274.5,657.3,274.5L657.3,274.5z M639.2,302.7 h36.1c-0.1-1.2-2.1-16.3-18.2-16.3C641.1,286.4,639.3,301.5,639.2,302.7z M698.9,340.5v-96.7H714v96.7H698.9z"/>
                    <path fill="currentColor" d="M282.9,228.5c0.1,0.3,0.1,0.5,0.1,0.8v40.4c0,1.1-0.6,2-1.5,2.6l-33.9,19.5v38.7c0,1.1-0.6,2-1.5,2.6 l-70.7,40.7c-0.2,0.1-0.3,0.2-0.5,0.2c-0.1,0-0.1,0.1-0.2,0.1c-0.5,0.1-1,0.1-1.5,0c-0.1,0-0.2-0.1-0.2-0.1 c-0.2-0.1-0.3-0.1-0.5-0.2l-70.7-40.7c-0.9-0.5-1.5-1.5-1.5-2.6V209.3c0-0.3,0-0.5,0.1-0.8c0-0.1,0.1-0.2,0.1-0.2 c0.1-0.2,0.1-0.3,0.2-0.5c0.1-0.1,0.1-0.2,0.2-0.3c0.1-0.1,0.2-0.2,0.3-0.3c0.1-0.1,0.2-0.1,0.3-0.2c0.1-0.1,0.2-0.2,0.3-0.3h0 l35.3-20.3c0.9-0.5,2-0.5,2.9,0l35.3,20.3h0c0.1,0.1,0.2,0.2,0.3,0.3c0.1,0.1,0.2,0.1,0.3,0.2c0.1,0.1,0.2,0.2,0.3,0.3 c0.1,0.1,0.1,0.2,0.2,0.3c0.1,0.1,0.1,0.3,0.2,0.5c0,0.1,0.1,0.2,0.1,0.3c0.1,0.3,0.1,0.5,0.1,0.8v75.6l29.5-17v-38.7 c0-0.3,0-0.5,0.1-0.8c0-0.1,0.1-0.2,0.1-0.3c0.1-0.2,0.1-0.3,0.2-0.5c0.1-0.1,0.1-0.2,0.2-0.3c0.1-0.1,0.2-0.2,0.3-0.3 c0.1-0.1,0.2-0.1,0.3-0.2c0.1-0.1,0.2-0.2,0.3-0.3h0l35.3-20.3c0.9-0.5,2-0.5,2.9,0l35.3,20.3c0.1,0.1,0.2,0.2,0.3,0.3 c0.1,0.1,0.2,0.1,0.3,0.2c0.1,0.1,0.2,0.2,0.3,0.3c0.1,0.1,0.1,0.2,0.2,0.3c0.1,0.1,0.1,0.3,0.2,0.5 C282.9,228.4,282.9,228.4,282.9,228.5z M277.1,267.9v-33.6l-12.4,7.1l-17.1,9.8v33.6L277.1,267.9L277.1,267.9z M241.8,328.7v-33.6 l-16.8,9.6l-48,27.4V366C177,366,241.8,328.7,241.8,328.7z M106.3,214.4v114.3l64.8,37.3v-33.9l-33.9-19.2l0,0l0,0 c-0.1-0.1-0.2-0.2-0.3-0.2c-0.1-0.1-0.2-0.1-0.3-0.2l0,0c-0.1-0.1-0.2-0.2-0.2-0.3c-0.1-0.1-0.2-0.2-0.2-0.3l0,0 c-0.1-0.1-0.1-0.2-0.2-0.4c0-0.1-0.1-0.2-0.1-0.3v0c0-0.1,0-0.3-0.1-0.4c0-0.1,0-0.2,0-0.3v0v-79l-17.1-9.8L106.3,214.4L106.3,214.4 z M138.7,192.3l-29.4,17l29.4,17l29.4-17L138.7,192.3L138.7,192.3z M154,298.1l17.1-9.8v-73.9l-12.4,7.1l-17.1,9.8v73.9 C141.7,305.3,154,298.1,154,298.1z M244.7,212.3l-29.4,17l29.4,17l29.4-17C274.2,229.3,244.7,212.3,244.7,212.3z M241.8,251.4 l-17.1-9.8l-12.4-7.1v33.6l17.1,9.8l12.4,7.1C241.8,284.9,241.8,251.4,241.8,251.4z M174,327l43.2-24.7l21.6-12.3l-29.4-16.9 l-33.9,19.5l-30.9,17.8C144.7,310.3,174,327,174,327z"/>
                </svg>
            </div>
            <h1>Laravel Storage Symlink Creator</h1>
            <p>Automatically create symbolic links for Laravel storage</p>
        </div>

        <div class="content">
            <div id="results">
                <!-- Results will be displayed here -->
            </div>

            <div class="actions">
                <button class="btn btn-primary" onclick="createSymlink()" id="createBtn">
                    <span>🔗</span> Create Symlink
                </button>
                <a href="/" class="btn btn-secondary">
                    <span>🏠</span> Return to Home
                </a>
                <button class="btn btn-success" onclick="testStorage()" id="testBtn">
                    <span>🧪</span> Test Storage Access
                </button>
            </div>

            <div class="warning-banner">
                ⚠️ <strong>Security Notice:</strong> Remember to delete this script after use!
            </div>
        </div>
    </div>

    <script>
        // Mock the PHP script functionality for demonstration
        function createSymlink() {
            const createBtn = document.getElementById('createBtn');
            const originalText = createBtn.innerHTML;
            
            createBtn.innerHTML = '<div class="loading"></div> Creating...';
            createBtn.disabled = true;

            // Simulate the symlink creation process
            setTimeout(() => {
                displayResults();
                createBtn.innerHTML = originalText;
                createBtn.disabled = false;
            }, 2000);
        }

        function displayResults() {
            const resultsDiv = document.getElementById('results');
            
            const resultHTML = `
                <div class="status-section">
                    <div class="status-card">
                        <span class="status-icon success">✅</span>
                        <strong>Project Root determined as:</strong> /home/newsquar/megaskyshop.com
                    </div>
                    
                    <div class="info-grid">
                        <div class="info-item">
                            <div class="info-label">Target (actual files location)</div>
                            <div class="info-value">/home/newsquar/megaskyshop.com/storage/app/public</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Link Name (publicly accessible path)</div>
                            <div class="info-value">/home/newsquar/megaskyshop.com/public/storage</div>
                        </div>
                    </div>

                    <div class="status-card">
                        <span class="status-icon info">ℹ️</span>
                        An item (file, directory, or symlink) already exists at: /home/newsquar/megaskyshop.com/public/storage
                        <br>Attempting to remove it...
                    </div>

                    <div class="status-card">
                        <span class="status-icon success">✅</span>
                        Successfully removed existing symlink.
                    </div>

                    <div class="status-card">
                        <span class="status-icon success">✅</span>
                        <strong>SUCCESS: Symbolic link created successfully!</strong>
                        <br>/home/newsquar/megaskyshop.com/public/storage ---> /home/newsquar/megaskyshop.com/storage/app/public
                    </div>
                </div>

                <div class="output-section">
                    <div style="color: #98c379; margin-bottom: 10px;">--- Laravel Symlink Creation Output ---</div>
                    <div style="color: #61dafb;">Project Root determined as: /home/newsquar/megaskyshop.com</div>
                    <div style="color: #e6e6e6;">Target (actual files location): /home/newsquar/megaskyshop.com/storage/app/public</div>
                    <div style="color: #e6e6e6;">Link Name (publicly accessible path): /home/newsquar/megaskyshop.com/public/storage</div>
                    <div style="color: #ffc107;">An item already exists at: /home/newsquar/megaskyshop.com/public/storage</div>
                    <div style="color: #ffc107;">Attempting to remove it...</div>
                    <div style="color: #98c379;">Successfully removed existing symlink.</div>
                    <div style="color: #61dafb;">Attempting to create symbolic link...</div>
                    <div style="color: #98c379; font-weight: bold;">SUCCESS: Symbolic link created successfully!</div>
                    <div style="color: #98c379;">/home/newsquar/megaskyshop.com/public/storage ---> /home/newsquar/megaskyshop.com/storage/app/public</div>
                    <div style="color: #e06c75; margin-top: 15px;">--- Script finished ---</div>
                    <div style="color: #e6e6e6;">Please test if your images/files are now accessible via the '/storage/' URL.</div>
                    <div style="color: #ffc107; font-weight: bold;">IMPORTANT: Remember to DELETE THIS SCRIPT from your server immediately!</div>
                    <div style="color: #ffc107;">Path: /home/newsquar/megaskyshop.com/public/scripts/create_correct_symlink.php</div>
                </div>
            `;
            
            resultsDiv.innerHTML = resultHTML;
        }

        function testStorage() {
            const testBtn = document.getElementById('testBtn');
            const originalText = testBtn.innerHTML;
            
            testBtn.innerHTML = '<div class="loading"></div> Testing...';
            testBtn.disabled = true;

            setTimeout(() => {
                alert('✅ Storage access test completed! Check your Laravel application to verify that files in storage/app/public are now accessible via /storage/ URLs.');
                testBtn.innerHTML = originalText;
                testBtn.disabled = false;
            }, 1500);
        }

        // Auto-run the script display on page load
        document.addEventListener('DOMContentLoaded', function() {
            // You can uncomment the line below to auto-run the script
            // createSymlink();
        });
    </script>
</body>
</html>