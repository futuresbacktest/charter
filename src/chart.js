import Chart from 'chart.js';
import chartAnnotations from 'chartjs-plugin-annotation';
import CSVToArray from './csvtoarray';
import throttle from 'lodash.throttle';

var palette = ['#003f5c', '#444e86', '#955196', '#dd5182', '#ff6e54', '#ffa600'];
palette = ["#5b9bd5", "#ed7d31", "#a5a5a5", "#ffc000", "#4472c4", "#70ad47", "#9e480e", "#997300", "#43682b", "#636363", "#264478"];

Chart.defaults.global.defaultFontColor = 'black';
Chart.defaults.global.defaultFontFamily = 'Roboto';
Chart.defaults.global.defaultFontSize = 13;

export default function chart(el, data, compare=false, logscale=true) {

	data = CSVToArray(data);

    const datasets = [];
	for (let i=1; i < data[0].length; i++) {
        const startVal = data[1][i];
		datasets.push({
			label: data[0][i],
			data: data.slice(1).map(e => ({t: new Date(e[0]), y: compare ? e[i]/startVal : e[i]})),
			backgroundColor: 'rgba(0,0,0,0)',
			borderColor: palette[i-1],
			borderWidth: 2
		  });
	}

	const annotation = {
        annotations: [{
            type: 'line',
            drawTime: 'afterDraw',
            mode: 'vertical',
            id: 'crosshair-1',
            scaleID: 'x-axis-0',
            borderColor: '#555555',
            borderWidth: 1
        }]
	};

	const chartObject = new Chart(el, {
		type: 'line',
		data: {
		  datasets
		},
		options: {
		  legend: {
				display: false
			},
			scales: {
				xAxes: [{
					type: 'time',
					time: {
						unit: 'year'
					}
                }],
                yAxes: [{
                    type: 'linear',
                    ticks: {
                        callback: compare ? (v) => (Math.round(v*100) + '%') : (v) => (v)
                    }
                }]
			},
			elements: {
				point:{
					radius: 0
				},
                line: {
                    tension: 0
                }
            },
			tooltips: {
				enabled: false
			},
			annotation,
			animation: {
                duration: 0
            }
		}
	});

	const formatLegend = (date, series) => {
		var legendHTML = date.toISOString().substr(0,10) + ': ';
        legendHTML = legendHTML + series.map((d, i) => '<em style="color:' + 
            palette[i] + ';">' + d.label + ': ' + 
            (compare ? Math.round(d.value * 1000) / 10 + '%' : Math.round(d.value * 100) / 100) +
            '</em>').join(' &nbsp; ');
		return legendHTML;
	}

	var container = document.createElement('div');
	container.className = 'charter-legend-container';

	var legend = document.createElement('div');
	legend.className = 'charter-legend';
	legend.innerHTML = formatLegend(datasets[0].data[datasets[0].data.length - 1].t,
		datasets.map((d) => ({label: d.label, value: d.data[d.data.length - 1].y})));
	container.appendChild(legend);

    if (logscale) {
        var log_label = document.createElement('label');
        log_label.className = 'charter-logscale';
        log_label.innerHTML = 'Log Scale';
        var log_input = document.createElement('input');
        log_input.type = 'checkbox';
        log_input.onclick = (e) => {
            if (e.target.checked) {
                chartObject.options.scales.yAxes[0].type = 'logarithmic';
            } else {
                chartObject.options.scales.yAxes[0].type = 'linear';
            }
            chartObject.update();
        };
        log_label.appendChild(log_input);
        container.appendChild(log_label);
    }

	el.before(container);
	
	el.onmousemove = throttle(function (evt) {
		var points = chartObject.getElementsAtXAxis(evt);
		var date = chartObject.config.data.datasets[0].data[points[0]._index].t;
		chartObject.annotation.elements['crosshair-1'].options.value = date.toISOString().substr(0,10);
		legend.innerHTML = formatLegend(date, points.map((p, i) => ({
			label: chartObject.config.data.datasets[i].label,
			value: chartObject.config.data.datasets[i].data[p._index].y
		})));
		chartObject.update();
	}, 50, {trailing: true});


	return chartObject;
};