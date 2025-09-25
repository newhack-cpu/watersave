

        // 全局变量存储计算结果
        let waterUsage = {
            total: 0,
            shower: 0,
            faucet: 0,
            toilet: 0,
            washing: 0,
            savingPotential: 0
        };
        
        // 图表实例
        let waterChart = null;
        
        // 显示加载指示器
        function showLoading() {
            const loader = document.getElementById('loading-indicator');
            loader.style.display = 'block';
        }
        
        // 隐藏加载指示器
        function hideLoading() {
            const loader = document.getElementById('loading-indicator');
            loader.style.display = 'none';
        }
        
        // 显示保存指示器
        function showSavedIndicator() {
            const indicator = document.getElementById('saved-indicator');
            indicator.style.display = 'block';
            setTimeout(() => {
                indicator.style.display = 'none';
            }, 2000);
        }
        
        // 页面导航功能
        function navigateToPage(pageId) {
            showLoading();
            
            // 更新导航状态
            document.querySelectorAll('.nav-item').forEach(i => {
                i.classList.remove('active');
            });
            document.querySelector(`[data-page="${pageId}"]`).classList.add('active');
            
            // 显示对应页面
            document.querySelectorAll('.page').forEach(page => {
                page.classList.remove('active');
            });
            
            // 添加动画效果
            setTimeout(() => {
                document.getElementById(`${pageId}-page`).classList.add('active');
                hideLoading();
                
                // 保存当前页面状态
                localStorage.setItem('lastPage', pageId);
                
                // 如果是结果页，更新数据
                if (pageId === 'result') {
                    updateResultPage();
                }
                
                // 如果是证书页，更新证书
                if (pageId === 'cert') {
                    updateCertificate();
                }
            }, 300);
        }
        
        // 表单边界检查
        function validateInputs() {
            const inputs = document.querySelectorAll('input[type="number"]');
            let isValid = true;
            
            inputs.forEach(input => {
                const value = parseFloat(input.value);
                const min = parseFloat(input.min);
                const max = parseFloat(input.max);
                
                if (isNaN(value) || value < min || value > max) {
                    isValid = false;
                    input.style.borderColor = 'var(--accent)';
                    input.style.animation = 'shake 0.5s';
                    
                    // 添加错误提示
                    if (!input.nextElementSibling || !input.nextElementSibling.classList.contains('error-msg')) {
                        const errorMsg = document.createElement('div');
                        errorMsg.className = 'error-msg';
                        errorMsg.style.color = 'var(--accent)';
                        errorMsg.style.fontSize = '0.8rem';
                        errorMsg.style.marginTop = '5px';
                        errorMsg.textContent = `请输入 ${min} 到 ${max} 之间的值`;
                        input.parentNode.appendChild(errorMsg);
                    }
                    
                    // 移除动画
                    setTimeout(() => {
                        input.style.animation = '';
                    }, 500);
                } else {
                    input.style.borderColor = '';
                    // 移除错误提示
                    if (input.nextElementSibling && input.nextElementSibling.classList.contains('error-msg')) {
                        input.nextElementSibling.remove();
                    }
                }
            });
            
            return isValid;
        }
        
        // 计算用水量
        function calculateWaterUsage() {
            const familyMembers = parseInt(document.getElementById('family-members').value) || 3;
            const showerTimes = parseInt(document.getElementById('shower-times').value) || 2;
            const showerMinutes = parseInt(document.getElementById('shower-minutes').value) || 10;
            const faucetTimes = parseInt(document.getElementById('faucet-times').value) || 8;
            const faucetMinutes = parseInt(document.getElementById('faucet-minutes').value) || 2;
            const toiletFlushes = parseInt(document.getElementById('toilet-flushes').value) || 12;
            const washingTimes = parseInt(document.getElementById('washing-times').value) || 3;
            
            // 计算各部分用水量（升/天）- 依据《河北省居民生活用水定额》（DB13/T 5457-2021）
            const showerWater = familyMembers * showerTimes * showerMinutes * 9; // 每分钟9升
            const faucetWater = familyMembers * faucetTimes * faucetMinutes * 6; // 每分钟6升
            const toiletWater = familyMembers * toiletFlushes * 6; // 每次6升
            const washingWater = washingTimes * 70 / 7; // 每周洗衣转换为日用水量（每次70升）
            
            const totalWater = showerWater + faucetWater + toiletWater + washingWater;
            
            // 计算节水潜力（基于河北平均350升）
            const savingPotential = Math.max(0, totalWater - 350);
            
            // 返回计算结果
            return {
                total: Math.round(totalWater),
                shower: Math.round(showerWater),
                faucet: Math.round(faucetWater),
                toilet: Math.round(toiletWater),
                washing: Math.round(washingWater),
                savingPotential: Math.round(savingPotential)
            };
        }
        
        // 生成个性化节水建议
        function generatePersonalizedTips(usage) {
            let tipsHTML = '<ul style="padding-left: 20px; margin: 15px 0;">';
            const maxUsage = Math.max(usage.shower, usage.faucet, usage.toilet, usage.washing);
            
            if (usage.shower === maxUsage) {
                tipsHTML += `<li>您的淋浴用水占比最高，缩短淋浴时间至8分钟，每天可节约 <span class="highlight">${Math.round(usage.shower * 0.2)}</span> 升水</li>`;
            }
            
            if (usage.faucet === maxUsage) {
                tipsHTML += `<li>您的洗漱用水占比最高，安装节水型水龙头，每次使用可节约30%用水</li>`;
            }
            
            if (usage.toilet === maxUsage) {
                tipsHTML += `<li>您的马桶用水占比最高，使用节水型马桶，每次冲水可节约3升</li>`;
            }
            
            if (usage.washing === maxUsage) {
                tipsHTML += `<li>您的洗衣用水占比最高，衣物集中洗涤，每周减少1次洗衣可节约 <span class="highlight">70</span> 升水</li>`;
            }
            
            // 通用建议
            tipsHTML += `<li>一水多用，如用洗菜水浇花，可提高用水效率</li>`;
            tipsHTML += `<li>及时修复漏水，一个滴水的水龙头每月可浪费3吨水</li>`;
            
            tipsHTML += '</ul>';
            return tipsHTML;
        }
        
        // 更新结果页
        function updateResultPage() {
            // 计算用水量
            waterUsage = calculateWaterUsage();
            
            // 更新总用水量
            document.getElementById('total-water-usage').textContent = waterUsage.total + ' 升';
            
            // 更新用水分布
            document.getElementById('shower-water').textContent = waterUsage.shower + ' 升';
            document.getElementById('faucet-water').textContent = waterUsage.faucet + ' 升';
            document.getElementById('toilet-water').textContent = waterUsage.toilet + ' 升';
            document.getElementById('washing-water').textContent = waterUsage.washing + ' 升';
            
            // 计算与平均值的差异
            const avgWater = 350; // 河北平均日用水量
            const difference = waterUsage.total - avgWater;
            const differencePercent = Math.round((difference / avgWater) * 100);
            
            document.getElementById('water-difference').textContent = 
                (difference >= 0 ? '+' : '') + differencePercent + '%';
            
            // 计算节水排名
            let ranking = '前50%';
            if (differencePercent <= -20) ranking = '前10%';
            else if (differencePercent <= 0) ranking = '前30%';
            else if (differencePercent <= 20) ranking = '前70%';
            else ranking = '后30%';
            
            document.getElementById('ranking').textContent = ranking;
            
            // 更新节水潜力
            document.getElementById('saving-potential').textContent = waterUsage.savingPotential + ' 升/天';
            document.getElementById('bottle-equivalent').textContent = Math.round(waterUsage.savingPotential / 0.5) + '瓶';
            document.getElementById('weekly-saving').textContent = (waterUsage.savingPotential * 7) + 'L';
            document.getElementById('yearly-saving').textContent = (waterUsage.savingPotential * 365) + 'L';
            
            // 生成并显示个性化建议
            document.getElementById('personalized-tips').innerHTML = generatePersonalizedTips(waterUsage);
            
            // 更新图表
            if (waterChart) {
                waterChart.data.datasets[0].data = [
                    waterUsage.shower, 
                    waterUsage.faucet, 
                    waterUsage.toilet, 
                    waterUsage.washing
                ];
                waterChart.update();
            }
        }
        
        // 更新证书
        function updateCertificate() {
            // 获取用户输入的姓名
            const userName = document.getElementById('user-name-input').value || '张节水';
            
            // 设置用户名称
            document.getElementById('user-name').textContent = userName;
            
            // 设置节水量
            document.getElementById('cert-saving').textContent = `每天节水 ${waterUsage.savingPotential}升`;
            
            // 设置日期
            const now = new Date();
            document.getElementById('cert-date').textContent = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`;
            
            // 计算全省节水潜力
            const provinceSaving = (waterUsage.savingPotential * 7.5 * 10000000 * 0.1 * 365 / 100000000).toFixed(1);
            document.getElementById('province-saving').textContent = provinceSaving;
        }
        
        // 保存数据到本地存储
        function saveFormData() {
            const formData = {
                familyMembers: document.getElementById('family-members').value,
                showerTimes: document.getElementById('shower-times').value,
                showerMinutes: document.getElementById('shower-minutes').value,
                faucetTimes: document.getElementById('faucet-times').value,
                faucetMinutes: document.getElementById('faucet-minutes').value,
                toiletFlushes: document.getElementById('toilet-flushes').value,
                washingTimes: document.getElementById('washing-times').value,
                userName: document.getElementById('user-name-input') ? document.getElementById('user-name-input').value : '张节水'
            };
            
            localStorage.setItem('waterFormData', JSON.stringify(formData));
            showSavedIndicator();
        }
        
        // 加载保存的数据
        function loadSavedData() {
            const savedData = localStorage.getItem('waterFormData');
            if (savedData) {
                const formData = JSON.parse(savedData);
                
                document.getElementById('family-members').value = formData.familyMembers;
                document.getElementById('shower-times').value = formData.showerTimes;
                document.getElementById('shower-minutes').value = formData.showerMinutes;
                document.getElementById('faucet-times').value = formData.faucetTimes;
                document.getElementById('faucet-minutes').value = formData.faucetMinutes;
                document.getElementById('toilet-flushes').value = formData.toiletFlushes;
                document.getElementById('washing-times').value = formData.washingTimes;
                
                if (document.getElementById('user-name-input')) {
                    document.getElementById('user-name-input').value = formData.userName;
                }
            }
        }
        
        // 页面加载时初始化
        document.addEventListener('DOMContentLoaded', function() {
            // 加载保存的数据
            loadSavedData();
            
            // 恢复上次访问的页面
            const lastPage = localStorage.getItem('lastPage') || 'home';
            navigateToPage(lastPage);
            
            // 初始化图表
            const waterCtx = document.getElementById('water-chart').getContext('2d');
            waterChart = new Chart(waterCtx, {
                type: 'doughnut',
                data: {
                    labels: ['淋浴', '洗漱', '马桶', '洗衣'],
                    datasets: [{
                        data: [0, 0, 0, 0],
                        backgroundColor: [
                            'rgba(26, 95, 173, 0.8)',
                            'rgba(39, 174, 96, 0.8)',
                            'rgba(155, 89, 182, 0.8)',
                            'rgba(241, 196, 15, 0.8)'
                        ],
                        borderColor: [
                            'rgba(26, 95, 173, 1)',
                            'rgba(39, 174, 96, 1)',
                            'rgba(155, 89, 182, 1)',
                            'rgba(241, 196, 15, 1)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                padding: 20,
                                font: {
                                    size: 13
                                }
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return `${context.label}: ${context.parsed}升`;
                                }
                            }
                        }
                    }
                }
            });
            
            // 添加摇动动画关键帧
            const style = document.createElement('style');
            style.textContent = `
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                    20%, 40%, 60%, 80% { transform: translateX(5px); }
                }
            `;
            document.head.appendChild(style);
            
            // 自动保存表单数据
            const inputs = document.querySelectorAll('input');
            inputs.forEach(input => {
                input.addEventListener('change', saveFormData);
                input.addEventListener('blur', saveFormData);
            });
        });
        
        // 事件监听器
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', function() {
                const pageId = this.getAttribute('data-page');
                navigateToPage(pageId);
            });
        });
        
        document.getElementById('start-btn').addEventListener('click', function() {
            navigateToPage('input');
        });
        
        document.getElementById('calculate-btn').addEventListener('click', function() {
            if (validateInputs()) {
                saveFormData();
                navigateToPage('result');
            }
        });
        
        document.getElementById('cert-btn').addEventListener('click', function() {
            navigateToPage('cert');
        });
        
        document.getElementById('restart-btn').addEventListener('click', function() {
            navigateToPage('input');
        });
        
        document.getElementById('download-btn').addEventListener('click', function() {
            alert('证书下载功能已触发！在实际应用中，这里会生成并下载证书图片。');
        });
        
        document.getElementById('share-btn').addEventListener('click', function() {
            const userName = document.getElementById('user-name-input').value || '节水先锋';
            const saving = waterUsage.savingPotential;
            alert(`分享功能已触发！\n\n我是${userName}，我每天可节水${saving}升，为美丽河北助力！\n\n在实际应用中，这里会调用设备的分享功能或生成分享海报。`);
        });
        
        // 姓名输入实时更新证书
        document.getElementById('user-name-input').addEventListener('input', function() {
            document.getElementById('user-name').textContent = this.value || '张节水';
            saveFormData();
        });
        
        // 方言切换功能
        document.getElementById('dialect-hebei').addEventListener('click', function() {
            document.querySelectorAll('.dialect-option').forEach(opt => {
                opt.classList.remove('active');
            });
            this.classList.add('active');
            
            document.getElementById('cert-content').innerHTML = `
                <div class="cert-title">节水承诺证书</div>
                <div class="cert-text">兹证明 <span class="highlight">${document.getElementById('user-name').textContent}</span> 家庭</div>
                <div class="cert-text">积极参与河北省节水行动</div>
                <div class="cert-water">俺每天节水 ${waterUsage.savingPotential}升</div>
                <div class="cert-text">承诺好好节水</div>
                <div class="cert-text">保护咱河北的水资源</div>
                
                <div class="cert-logo">
                    <i class="fas fa-tint"></i>
                </div>
                
                <div class="cert-text">河北省公益广告大赛推荐</div>
                <div class="cert-text">${document.getElementById('cert-date').textContent}</div>
            `;
        });
        
        document.getElementById('dialect-standard').addEventListener('click', function() {
            document.querySelectorAll('.dialect-option').forEach(opt => {
                opt.classList.remove('active');
            });
            this.classList.add('active');
            
            document.getElementById('cert-content').innerHTML = `
                <div class="cert-title">节水承诺证书</div>
                <div class="cert-text">兹证明 <span class="highlight">${document.getElementById('user-name').textContent}</span> 家庭</div>
                <div class="cert-text">积极参与河北省节水行动</div>
                <div class="cert-water">每天节水 ${waterUsage.savingPotential}升</div>
                <div class="cert-text">承诺践行节约用水</div>
                <div class="cert-text">保护河北水资源</div>
                
                <div class="cert-logo">
                    <i class="fas fa-tint"></i>
                </div>
                
                <div class="cert-text">河北省公益广告大赛推荐</div>
                <div class="cert-text">${document.getElementById('cert-date').textContent}</div>
            `;
        });
