// public/js/chart.js

let masteryChartInstance = null;

// Function to get theme-specific colors
function getChartColors(isDarkMode) {
    const rootStyle = getComputedStyle(document.documentElement);
    if (isDarkMode) {
        return {
            text: rootStyle.getPropertyValue('--chart-dark-text-color').trim() || '#C9D1D9',
            grid: rootStyle.getPropertyValue('--border-color').trim() || '#30363D',
            tooltipBg: 'rgba(30, 35, 40, 0.9)',
            tooltipText: '#E0E7EF',
            segmentBackgrounds: [
                rootStyle.getPropertyValue('--chart-dark-new-bg').trim(),
                rootStyle.getPropertyValue('--chart-dark-learning1-bg').trim(),
                rootStyle.getPropertyValue('--chart-dark-learning2-bg').trim(),
                rootStyle.getPropertyValue('--chart-dark-learning3-bg').trim(),
                rootStyle.getPropertyValue('--chart-dark-reviewing-bg').trim(),
                rootStyle.getPropertyValue('--chart-dark-mastered-bg').trim(),
            ],
            segmentBorders: [
                rootStyle.getPropertyValue('--chart-dark-new-border').trim(),
                rootStyle.getPropertyValue('--chart-dark-learning1-border').trim(),
                rootStyle.getPropertyValue('--chart-dark-learning2-border').trim(),
                rootStyle.getPropertyValue('--chart-dark-learning3-border').trim(),
                rootStyle.getPropertyValue('--chart-dark-reviewing-border').trim(),
                rootStyle.getPropertyValue('--chart-dark-mastered-border').trim(),
            ]
        };
    } else { // Light Mode
        return {
            text: rootStyle.getPropertyValue('--chart-light-text-color').trim() || '#34495E',
            grid: rootStyle.getPropertyValue('--border-color').trim() || '#DDE2E7',
            tooltipBg: 'rgba(255, 255, 255, 0.95)',
            tooltipText: '#34495E',
            segmentBackgrounds: [
                rootStyle.getPropertyValue('--chart-light-new-bg').trim(),
                rootStyle.getPropertyValue('--chart-light-learning1-bg').trim(),
                rootStyle.getPropertyValue('--chart-light-learning2-bg').trim(),
                rootStyle.getPropertyValue('--chart-light-learning3-bg').trim(),
                rootStyle.getPropertyValue('--chart-light-reviewing-bg').trim(),
                rootStyle.getPropertyValue('--chart-light-mastered-bg').trim(),
            ],
            segmentBorders: [
                rootStyle.getPropertyValue('--chart-light-new-border').trim(),
                rootStyle.getPropertyValue('--chart-light-learning1-border').trim(),
                rootStyle.getPropertyValue('--chart-light-learning2-border').trim(),
                rootStyle.getPropertyValue('--chart-light-learning3-border').trim(),
                rootStyle.getPropertyValue('--chart-light-reviewing-border').trim(),
                rootStyle.getPropertyValue('--chart-light-mastered-border').trim(),
            ]
        };
    }
}

export function renderMasteryDoughnutChart(canvasId, masteryData, masteryLabels) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;
    if (typeof Chart === 'undefined') {
        ctx.parentElement.innerHTML = '<p class="chart-error-message">Thư viện Chart.js chưa được tải.</p>';
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
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '65%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: colors.text,
                        font: { size: 14, family: 'var(--font-primary)', weight: '600' },
                        padding: 20,
                        usePointStyle: true,
                        pointStyle: 'circle',
                    },
                },
                tooltip: {
                    enabled: true,
                    backgroundColor: colors.tooltipBg,
                    titleColor: colors.tooltipText,
                    bodyColor: colors.tooltipText,
                    borderColor: colors.grid,
                    borderWidth: 1,
                    padding: 12,
                    cornerRadius: 6,
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((acc, val) => acc + val, 0);
                            const percentage = total > 0 ? (context.parsed / total * 100).toFixed(1) : 0;
                            return `${context.label}: ${context.parsed} từ (${percentage}%)`;
                        }
                    }
                },
            },
        },
    });
    return masteryChartInstance;
}

export function updateChartTheme() {
    if (masteryChartInstance) {
        const isDarkMode = document.body.getAttribute('data-theme') === 'dark';
        const colors = getChartColors(isDarkMode);

        const dataset = masteryChartInstance.data.datasets[0];
        dataset.backgroundColor = colors.segmentBackgrounds;
        dataset.borderColor = colors.segmentBorders;
        
        const legendLabels = masteryChartInstance.options.plugins.legend.labels;
        legendLabels.color = colors.text;

        const tooltip = masteryChartInstance.options.plugins.tooltip;
        tooltip.backgroundColor = colors.tooltipBg;
        tooltip.titleColor = colors.tooltipText;
        tooltip.bodyColor = colors.tooltipText;
        tooltip.borderColor = colors.grid;

        masteryChartInstance.update('none');
    }
}