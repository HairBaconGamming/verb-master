// public/js/charts.js

let masteryChartInstance = null;

// Function to get theme-specific colors
function getChartColors(isDarkMode) {
    const rootStyle = getComputedStyle(document.documentElement);
    if (isDarkMode) {
        return {
            text: rootStyle.getPropertyValue('--chart-light-text-color').trim() || '#C9D1D9',
            grid: rootStyle.getPropertyValue('--border-color').trim() || '#30363D',
            tooltipBg: 'rgba(30, 35, 40, 0.9)', // Darker tooltip
            tooltipText: '#E0E7EF',
            segmentBackgrounds: [
                rootStyle.getPropertyValue('--chart-dark-new-bg').trim() || '#4A5568',      // NEW (Dark Grey)
                rootStyle.getPropertyValue('--chart-dark-learning1-bg').trim() || '#4299E1', // LEARNING_1 (Darker Blue)
                rootStyle.getPropertyValue('--chart-dark-learning2-bg').trim() || '#3182CE', // LEARNING_2
                rootStyle.getPropertyValue('--chart-dark-learning3-bg').trim() || '#2B6CB0', // LEARNING_3
                rootStyle.getPropertyValue('--chart-dark-reviewing-bg').trim() || '#D69E2E', // REVIEWING (Darker Amber)
                rootStyle.getPropertyValue('--chart-dark-mastered-bg').trim() || '#38A169',  // MASTERED (Darker Green)
            ],
            segmentBorders: [
                rootStyle.getPropertyValue('--chart-dark-new-border').trim() || '#2D3748',
                rootStyle.getPropertyValue('--chart-dark-learning1-border').trim() || '#2C5282',
                rootStyle.getPropertyValue('--chart-dark-learning2-border').trim() || '#2A4365',
                rootStyle.getPropertyValue('--chart-dark-learning3-border').trim() || '#1A365D',
                rootStyle.getPropertyValue('--chart-dark-reviewing-border').trim() || '#975A16',
                rootStyle.getPropertyValue('--chart-dark-mastered-border').trim() || '#276749',
            ]
        };
    } else { // Light Mode
        return {
            text: rootStyle.getPropertyValue('--chart-dark-text-color').trim() || '#34495E',
            grid: rootStyle.getPropertyValue('--border-color').trim() || '#DDE2E7',
            tooltipBg: 'rgba(255, 255, 255, 0.95)', // Lighter tooltip
            tooltipText: '#34495E',
            segmentBackgrounds: [
                rootStyle.getPropertyValue('--chart-light-new-bg').trim() || '#E2E8F0',       // NEW (Light Grey)
                rootStyle.getPropertyValue('--chart-light-learning1-bg').trim() || '#90CDF4',  // LEARNING_1 (Light Blue)
                rootStyle.getPropertyValue('--chart-light-learning2-bg').trim() || '#63B3ED',  // LEARNING_2
                rootStyle.getPropertyValue('--chart-light-learning3-bg').trim() || '#4299E1',  // LEARNING_3
                rootStyle.getPropertyValue('--chart-light-reviewing-bg').trim() || '#F6E05E',  // REVIEWING (Light Yellow)
                rootStyle.getPropertyValue('--chart-light-mastered-bg').trim() || '#68D391',   // MASTERED (Light Green)
            ],
            segmentBorders: [
                rootStyle.getPropertyValue('--chart-light-new-border').trim() || '#CBD5E0',
                rootStyle.getPropertyValue('--chart-light-learning1-border').trim() || '#4A5568', // Using darker for contrast
                rootStyle.getPropertyValue('--chart-light-learning2-border').trim() || '#2C5282',
                rootStyle.getPropertyValue('--chart-light-learning3-border').trim() || '#2A4365',
                rootStyle.getPropertyValue('--chart-light-reviewing-border').trim() || '#B7791F',
                rootStyle.getPropertyValue('--chart-light-mastered-border').trim() || '#2F855A',
            ]
        };
    }
}


export function renderMasteryDoughnutChart(canvasId, masteryData, masteryLabels) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) {
        console.warn(`Canvas element with id '${canvasId}' not found.`);
        return null;
    }
    if (typeof Chart === 'undefined') {
        console.warn('Chart.js is not loaded. Cannot render mastery chart.');
        const p = document.createElement('p');
        p.textContent = 'Biểu đồ không thể tải. Vui lòng kiểm tra thư viện Chart.js.';
        p.className = 'chart-error-message';
        ctx.parentNode.replaceChild(p, ctx);
        return null;
    }

    if (masteryChartInstance) {
        masteryChartInstance.destroy();
    }

    const isDarkMode = document.body.getAttribute('data-theme') === 'dark';
    const colors = getChartColors(isDarkMode);

    masteryChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: masteryLabels,
            datasets: [{
                label: 'Số lượng từ',
                data: masteryData,
                backgroundColor: colors.segmentBackgrounds,
                borderColor: colors.segmentBorders,
                borderWidth: 2,
                hoverOffset: 8,
                hoverBorderColor: isDarkMode ? '#fff' : '#333',
                hoverBorderWidth: 2,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '65%', // Makes it a doughnut chart
            animation: {
                animateRotate: true,
                animateScale: true,
                duration: 1000,
                easing: 'easeInOutQuart'
            },
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: colors.text, // Sử dụng màu text từ theme
                        font: {
                            size: 14, // TĂNG KÍCH THƯỚC FONT
                            family: 'var(--font-primary)',
                            weight: '600', // TĂNG ĐỘ ĐẬM
                        },
                        padding: 20,
                        usePointStyle: true,
                        pointStyle: 'circle', // hoặc 'rectRounded' cho hình vuông bo góc
                        boxWidth: 12, // Kích thước của point style
                        boxHeight: 12,
                    },
                    onHover: (event, legendItem, legend) => {
                        const chart = legend.chart;
                        if (chart.getDatasetMeta(0).data[legendItem.index]) {
                             chart.getDatasetMeta(0).data[legendItem.index].financialHover = true; // custom property
                             chart.update();
                        }
                        event.native.target.style.cursor = 'pointer';
                    },
                    onLeave: (event, legendItem, legend) => {
                        const chart = legend.chart;
                         if (chart.getDatasetMeta(0).data[legendItem.index]) {
                             chart.getDatasetMeta(0).data[legendItem.index].financialHover = false; // custom property
                             chart.update();
                        }
                        event.native.target.style.cursor = 'default';
                    },
                },
                title: {
                    display: false, // We have a card title
                },
                tooltip: {
                    enabled: true,
                    backgroundColor: colors.tooltipBg,
                    titleColor: colors.tooltipText,
                    titleFont: { size: 14, family: 'var(--font-primary)', weight: '600' },
                    bodyColor: colors.tooltipText,
                    bodyFont: { size: 12, family: 'var(--font-primary)' },
                    padding: 12,
                    cornerRadius: 6,
                    borderColor: colors.grid,
                    borderWidth: 1,
                    boxPadding: 4, // Add padding inside the tooltip box
                    displayColors: true, // Show color box next to label
                    callbacks: {
                        label: function(context) {
                            let label = context.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed !== null) {
                                const total = context.dataset.data.reduce((acc, val) => acc + val, 0);
                                const percentage = total > 0 ? (context.parsed / total * 100).toFixed(1) : 0;
                                label += `${context.parsed} từ (${percentage}%)`;
                            }
                            return label;
                        }
                    }
                },
                // Custom plugin to draw text in the middle of doughnut
                htmlLegend: { // This is a placeholder for a custom plugin if needed
                    // We can draw text directly using Chart.js's plugin API
                }
            },
            // Interaction for highlighting segments on legend hover
            onHover: (event, chartElement, chart) => {
                 if (chartElement.length) {
                    const index = chartElement[0].index;
                    const activeSegment = chart.getDatasetMeta(0).data[index];
                    // You can apply custom styling to activeSegment here if Chart.js doesn't do it automatically
                 }
            },
            // Custom elements for center text (more advanced)
            // elements: {
            //     center: {
            //         text: 'Total Verbs',
            //         color: '#FF6384', // Default color
            //         fontStyle: 'Arial', // Default font
            //         sidePadding: 20 // Default side padding
            //     }
            // }
        },
        // Registering a custom plugin to draw text in the center (if desired)
        plugins: [{
            id: 'doughnutText',
            beforeDraw: function(chart) {
                if (chart.config.type === 'doughnut' && chart.config.options.plugins.htmlLegend.textCenter) { // Check for a custom option
                    const { width, height, ctx } = chart;
                    ctx.restore();
                    const fontStyle = chart.config.options.plugins.htmlLegend.fontStyle || '1.2em var(--font-primary)';
                    const textColor = chart.config.options.plugins.htmlLegend.textColor || colors.text;
                    
                    ctx.font = fontStyle;
                    ctx.textBaseline = 'middle';
                    ctx.textAlign = 'center';
                    ctx.fillStyle = textColor;

                    const text = chart.config.options.plugins.htmlLegend.textCenter;
                    const textX = width / 2;
                    const textY = height / 2;

                    ctx.fillText(text, textX, textY);
                    ctx.save();
                }
            }
        }]
    });
    return masteryChartInstance;
}

export function updateChartTheme() {
    if (masteryChartInstance) {
        const isDarkMode = document.body.getAttribute('data-theme') === 'dark';
        const colors = getChartColors(isDarkMode);

        masteryChartInstance.data.datasets[0].backgroundColor = colors.segmentBackgrounds;
        masteryChartInstance.data.datasets[0].borderColor = colors.segmentBorders;
        
        masteryChartInstance.options.plugins.legend.labels.color = colors.text;
        masteryChartInstance.options.plugins.tooltip.backgroundColor = colors.tooltipBg;
        masteryChartInstance.options.plugins.tooltip.titleColor = colors.tooltipText;
        masteryChartInstance.options.plugins.tooltip.bodyColor = colors.tooltipText;
        masteryChartInstance.options.plugins.tooltip.borderColor = colors.grid;

        // If using the custom center text plugin
        if (masteryChartInstance.config.options.plugins.htmlLegend.textCenter) {
            masteryChartInstance.config.options.plugins.htmlLegend.textColor = colors.text;
        }

        masteryChartInstance.update('none'); // 'none' for no animation on theme change
    }
}