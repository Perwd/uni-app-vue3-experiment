//useCounter.js
import { computed, watch } from "vue";
import { useCounterStore } from '../pinia/cart';
import { storeToRefs } from 'pinia'

export default function() {
	const double = computed(() => Number(count) * 2)

	const store = useCounterStore();
	const {
		count,
		total
	} = storeToRefs(store)

	function setBadge() {


		if (typeof total.value === 'number' && total.value !== 0) {

			// 调用 uni.setTabBarBadge() 方法，为购物车设置右上角的徽标
			uni.setTabBarBadge({
				index: 2, // 索引
				// 注意：text 的值必须是字符串，不能是数字
				// text: `${total.value}`,
				text: `${total.value}`,
			})
		}

	}

	watch(() => total, (newValue, oldValue) => {
		console.log(newValue)
		console.log(oldValue)
		setBadge()
	})
	return {
		count,
		double,
		setBadge
	}
}
