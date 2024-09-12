const ctx = document.getElementById('timeAllocationChart').getContext('2d');
const timeAllocationChart = new Chart(ctx, {
    type: 'pie',
    data: {
        labels: ['Assignment/Lab', 'Concept/Lecture', 'Guide/Review', 'Test/Quiz', 'Exam'],
        datasets: [{
            data: [54, 29, 9, 1, 6],
            backgroundColor: ['#f39c12', '#e67e22', '#34495e', '#95a5a6', '#3498db'],
            hoverOffset: 4
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            }
        }
    }
});