<template>
	<!-- 最外层的容器 -->
	<view class="my-settle-container">
		<!-- 全选区域 -->
		<label class="radio" @click="changeAllState">
			<radio color="#C00000" :checked="isFullCheck" /><text>全选</text>
		</label>

		<!-- 合计区域 -->
		<view class="amount-box">
			合计:<text class="amount">￥{{checkedGoodsAmount}}</text>
		</view>

		<!-- 结算按钮 -->

		<view class="btn-settle" @click="settlement">结算({{checkedCount}})</view>
	</view>


</template>

<script setup lang="ts">
	import {
		ref,
		computed,
		// reactive
	} from "vue";
	import {
		// onLoad
	} from "@dcloudio/uni-app";
	// import {
	// 	storeToRefs
	// } from 'pinia'
	import {
		useCounterStore
	} from '../../pinia/cart';

	import {
		userAddress
	} from '../../pinia/user';
	import type {
		Cart
	} from '../../pinia/cart';
	const {
		checkedCount,
		total,
		checkedGoodsAmount,
		updateAllGoodsState,
		cart
	} = useCounterStore()


	const {
		addStr,
		token,
		updateRedirectInfo
	} = userAddress()

	let seconds = ref(3)
	let timer: any = null

	const isFullCheck = computed(() => {
		return total === checkedCount
	}, )



	const changeAllState = () => {
		// 修改购物车中所有商品的选中状态
		// !this.isFullCheck 表示：当前全选按钮的状态取反之后，就是最新的勾选状态
		updateAllGoodsState(!isFullCheck)
	}


	function settlement() {
		// 1. 先判断是否勾选了要结算的商品
		if (!checkedCount) return (uni as any).$showMsg('请选择要结算的商品！')

		// 2. 再判断用户是否选择了收货地址
		if (!addStr) return (uni as any).$showMsg('请选择收货地址！')

		// 3. 最后判断用户是否登录了
		// if (!token) return (uni as any).$showMsg('请先登录！')
		if (!token) return delayNavigate()


		//支付 
		payOrder()
	}



	// 延迟导航到 my 页面
	function delayNavigate() {

		seconds.value = 3
		// 1. 将定时器的 Id 存储到 timer 中
		timer = setInterval(() => {
			seconds.value--

			// 2. 判断秒数是否 <= 0
			if (seconds.value <= 0) {
				// 2.1 清除定时器
				clearInterval(timer)
				timer = null

				// 2.2 跳转到 my 页面
				uni.switchTab({
					url: '/pages/my/my',
					// 页面跳转成功之后的回调函数
					success: () => {
						let sendData = {
							// 跳转的方式
							openType: 'switchTab',
							// 从哪个页面跳转过去的
							from: '/pages/cart/cart'
						}


						// 调用 pinia 的 updateRedirectInfo 方法，把跳转信息存储到 Store 中
						updateRedirectInfo(sendData)
					}
				})

				// 2.3 终止后续代码的运行（当秒数为 0 时，不再展示 toast 提示消息）
				return
			}

			showTips(seconds.value)
		}, 1000)
	}


	// 展示倒计时的提示消息
	function showTips(n = 3) {

		uni.showToast({
			icon: 'none',
			title: '请登录后再结算！' + n + ' 秒后自动跳转到登录页',
			// 为页面添加透明遮罩，防止点击穿透
			mask: true,
			duration: 1500
		})
	}

	// 微信支付
	const payOrder = async () => {
		// 1. 创建订单
		// 1.1 组织订单的信息对象
		const orderInfo = {
			// 开发期间，注释掉真实的订单价格，
			// order_price: this.checkedGoodsAmount,
			// 写死订单总价为 1 分钱
			order_price: 0.01,
			consignee_addr: addStr,
			goods: cart.filter((x: Cart) => x.goods_state).map((x: Cart) => ({
				goods_id: x.goods_id,
				goods_number: x.goods_count,
				goods_price: x.goods_price
			}))
		}
		// 1.2 发起请求创建订单
		const {
			data: res
		} = await (uni as any).$http.post('/api/public/v1/my/orders/create', orderInfo)
		if (res.meta.status !== 200) return (uni as any).$showMsg('创建订单失败！')
		// 1.3 得到服务器响应的“订单编号”
		const orderNumber = res.message.order_number

		// 2. 订单预支付
		// 2.1 发起请求获取订单的支付信息
		const {
			data: res2
		} = await (uni as any).$http.post('/api/public/v1/my/orders/req_unifiedorder', {
			order_number: orderNumber
		})
		// 2.2 预付订单生成失败
		if (res2.meta.status !== 200) return (uni as any).$showError('预付订单生成失败！')
		// 2.3 得到订单支付相关的必要参数
		const payInfo = res2.message.pay


		// 3. 发起微信支付
		// 3.1 调用 uni.requestPayment() 发起微信支付
		// await uni.requestPayment(payInfo).then((res: any) => {
		// 	// 3.2 未完成支付
		// 	if (res.err) return uni.$showMsg('订单未支付！')
		// })
		uni.requestPayment({
			provider: 'alipay',
			orderInfo: payInfo, //微信、支付宝订单数据 【注意微信的订单信息，键值应该全部是小写，不能采用驼峰命名】
			success: function(res) {
				console.log('success:' + JSON.stringify(res));
			},
			fail: function(err) {
				console.log('fail:' + JSON.stringify(err));
			}
		});



		// 3.3 完成了支付，进一步查询支付的结果
		const {
			data: res3
		} = await (uni as any).$http.post('/api/public/v1/my/orders/chkOrder', {
			order_number: orderNumber
		})
		// 3.4 检测到订单未支付
		if (res3.meta.status !== 200) return (uni as any).$showMsg('订单未支付！')
		// 3.5 检测到订单支付完成
		uni.showToast({
			title: '支付完成！',
			icon: 'success'
		})
	}
</script>

<style lang="scss">
	.my-settle-container {
		position: fixed;
		bottom: 0;
		left: 0;
		width: 100%;
		height: 50px;
		// 将背景色从 cyan 改为 white
		background-color: white;
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-left: 5px;
		font-size: 14px;

		.radio {
			display: flex;
			align-items: center;
		}

		.amount {
			color: #c00000;
		}

		.btn-settle {
			height: 50px;
			min-width: 100px;
			background-color: #c00000;
			color: white;
			line-height: 50px;
			text-align: center;
			padding: 0 10px;
		}
	}
</style>
