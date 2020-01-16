
import chart from './chart';

const valueStore = {};
const cbStore = {};

export default function makeChart(el, collection, key, version=1, compare=false, logscale=true) {

	if (valueStore[collection]) {
		return chart(el, valueStore[collection][key]);
	} else {
		if (cbStore[collection]) {
			cbStore[collection].push((data) => chart(el, data[key], compare, logscale));
		} else {
			cbStore[collection] = [(data) => {
				valueStore[collection] = data;
			}, (data) => chart(el, data[key], compare, logscale)];
			fetch("https://www.futuresbacktest.com/api/static/items?a=2&collection=" + 
				collection + '&version=' + version)
			.then((resp) => resp.json())
			.then((data) => {
	  			if (data) {
					cbStore[collection].forEach((cb) => cb(data));
				}
			});
		}
	}
}