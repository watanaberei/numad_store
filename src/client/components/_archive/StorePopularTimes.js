export const popularTimeHTML = {
    render: (popularTimes) => {
         storePopularTimes(popularTimes).init();
      return `
              <div id="chartsContainer">
                 chartsContainer
              </div>
              `;
    },
  };
  


export async function storePopularTimes(popularTimes) {
    try {
 const currentHour = new Date().getHours();
        const currentDay = new Date().getDay();
        const chartsContainer = document.getElementById('chartsContainer');

        for (let dayIndex = 1; dayIndex < popularTimes[0].length; dayIndex++) {
            const dayContainer = document.createElement('div');
            dayContainer.classList.add('chart');

            const header = document.createElement('div');
            header.classList.add('day-title');
            header.textContent = popularTimes[0][dayIndex];
            dayContainer.appendChild(header);

            if (dayIndex === currentDay + 1) {
                const currentStatus = document.createElement('div');
                currentStatus.classList.add('status');
                const currentValue = parseInt(popularTimes[currentHour + 1][dayIndex]);
                if (currentValue >= 0 && currentValue <= 5) {
                    currentStatus.textContent = "NOT BUSY";
                    currentStatus.classList.add('not-busy');
                } else if (currentValue > 5 && currentValue <= 10) {
                    currentStatus.textContent = "MODERATELY BUSY";
                    currentStatus.classList.add('moderately-busy');
                } else if (currentValue > 10 && currentValue <= 12) {
                    currentStatus.textContent = "BUSY";
                    currentStatus.classList.add('busy');
                } else {
                    currentStatus.textContent = "PACKED";
                    currentStatus.classList.add('packed');
                }

                dayContainer.appendChild(currentStatus);
            }

            // Create hours
            for (let j = 1; j < dayData.length; j++) {
                // Create hour div
                const hourDiv = document.createElement('div');
                hourDiv.className = 'hour';

                // Hour label
                const hourLabelDiv = document.createElement('div');
                hourLabelDiv.className = 'hour-label';
                hourLabelDiv.textContent = popularTimes[0][j]; // Hour label from the header row

                // Bar div
                const barDiv = document.createElement('div');
                barDiv.className = 'bar';
                barDiv.style.height = dayData[j] + 'px'; // Height based on the data

                hourDiv.appendChild(hourLabelDiv);
                hourDiv.appendChild(barDiv);
                chartDiv.appendChild(hourDiv);
            }

if (chartsContainer) {
            chartsContainer.appendChild(dayContainer);
} else {
console.error('chartsContainer element not found');
}
        }
    } catch (err) {
        console.log(err);
    }
}
