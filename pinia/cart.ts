// import { type } from 'os';
import { defineStore } from 'pinia';
import { TestType } from './store/type';

type Cart = {
	goods_id: string,
	goods_name: string,
	goods_price: number,
	goods_count: number,
	goods_small_logo: string,
	goods_state: Boolean,
}
// 接口继承
// interface StateType extends TestType {
// 	cart: Cart[],
// 	count: number,
// 	type: string,
// 	// name:TestType ,
// 	// id: TestType,
// 	row?: object
// }

type StateType = TestType & {
	cart: Cart[],
	count: number,
	type: string,
	// name:TestType ,
	// id: TestType,
	row?: object
}

export const useCounterStore =
	// defineStore('cart', {  方式一
	defineStore({
		id: 'cart',
		state: () => {
			return {
				count: 0,
				type: 'wxxcx',
				name: 'wlr',
				id: "000000",
				row: {},
				// 购物车的数组，用来存储购物车中每个商品的信息对象
				// 每个商品的信息对象，都包含如下 6 个属性：
				// { goods_id, goods_name, goods_price, goods_count, goods_small_logo, goods_state }
				cart: new Array<Cart>(),
				// cart: [],
			};
		},
		// 也可以这样定义
		// state: () => ({ count: 0 })
		actions: {
			increment() {
				this.count++;
			},

			// 2秒后更新状态
			updateUid(context: any, payload: any) {
				setTimeout(() => {
					context.commit('updateUid', payload)
				}, 2000)
			},
			apiGetUid(context: any) {
				console.log('vuex', context)

				this.count++
				console.log(this.count)
				console.log(this.type)
				console.log(this.name)
			},
			addToCart(goods: Cart) {

				const findResult = this.cart.find((x: Cart) => x.goods_id === goods.goods_id)

				if (!findResult) {
					// 没有这件商品，则直接 push
					this.cart.push(goods)

				} else {
					// 有这件商品，增加
					findResult.goods_count++
				}

				console.log(this.cart)
			},
		}

	});