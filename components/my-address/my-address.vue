<template>
	<view>

		<!-- 选择收货地址的盒子 -->
		<view v-if="JSON.stringify(address) === '{}'" class="address-choose-box">
			<button @click="chooseAddress" type="primary" size="mini" class="btnChooseAddress">请选择收货地址+</button>
		</view>

		<!-- 渲染收货信息的盒子 -->
		<view v-else @click="chooseAddress" class="address-info-box">
			<view class="row1">
				<view class="row1-left">
					<view class="username">收货人：<text>{{address?.userName}}</text></view>
				</view>
				<view class="row1-right">
					<view class="phone">电话：<text>{{address?.telNumber}}</text></view>
					<uni-icons type="arrowright" size="16"></uni-icons>
				</view>
			</view>
			<view class="row2">
				<view class="row2-left">收货地址：</view>
				<view class="row2-right">{{addStr}}</view>

			</view>
		</view>

		<!-- 底部的边框线 -->
		<image src="/static/cart_border@2x.png" class="address-border"></image>
	</view>

</template>

<script setup lang="ts">
	// import {
	//     ref,
	//     computed
	// } from "vue";
	import {
		onLoad
	} from "@dcloudio/uni-app";
	import {
		storeToRefs
	} from 'pinia'
	import {
		userAddress
	} from '../../pinia/user';
	const {
		updateAddress
	} = userAddress();
	const {
		addStr,
		address
	} = storeToRefs(userAddress())


	// const swiperList = ref({
	//     provinceName: '',
	//     cityName: '',
	//     countyName: '',
	//     detailInfo: '',
	//     userName: '',
	//     telNumber: ''
	// });
	// let address: Ress = ref(Object.create(null))
	// const address = ref({
	//     provinceName: '',
	//     cityName: '',
	//     countyName: '',
	//     detailInfo: '',
	//     userName: '',
	//     telNumber: ''
	// })





	// let address = ref < Ress > ()
	// const addStr = computed(() => {
	//     if (!address) return ''

	//     // 拼接 省，市，区，详细地址 的字符串并返回给用户
	//     return address.provinceName + address.cityName + address.countyName + address.detailInfo

	// })

	const chooseAddress = () => {

		uni.chooseAddress({
			success(res) {

				address.value = res

				console.log(address)
				console.log('address')


				updateAddress(address)
			},
			fail(err) {
				if (err) reAuth()
			},
			complete() {
				console.log('完成')
			}
		})


	}

	// function chooseAddress() {
	// 	// const data = uni.chooseAddress({})
	// 	// console.log(data)

	// 	console.log(1)
	// 	uni.chooseAddress({
	// 		success(res) {
	// 			console.log(res)
	// 			address.value = res
	// 		},
	// 		fail(err) {
	// 			console.log('错误', err)
	// 		},
	// 		complete() {
	// 			console.log('完成')
	// 		}
	// 	})
	// }

	// 调用此方法，重新发起收货地址的授权
	const reAuth = () => {
		// 3.1 提示用户对地址进行授权
		if (!address) {
			uni.showModal({
				content: '检测到您没打开地址权限，是否去设置打开？',
				confirmText: "确认",
				cancelText: "取消",
				success: function(res) {
					if (res.confirm) {
						console.log('用户点击确定');
						uni.openSetting({
							success(suc) {
								console.log(suc);
								(uni as any).openSetting({
									// 3.4.1 授权结束，需要对授权的结果做进一步判断
									success: (settingResult: any) => {
										// 3.4.2 地址授权的值等于 true，提示用户 “授权成功”
										if (settingResult.authSetting[
												'scope.address']) return (
											uni as any).$showMsg(
											'授权成功！请选择地址')
										// 3.4.3 地址授权的值等于 false，提示用户 “您取消了地址授权”
										if (!settingResult.authSetting[
												'scope.address']) return (
											uni as any).$showMsg(
											'您取消了地址授权！')
									}
								})
							}
						});
					} else if (res.cancel) {
						console.log('用户点击取消');
						(uni as any).$showMsg('您取消了地址授权！')
					}
				},
				fail: function(err) {
					console.log(err)
				},
				complete: function() {
					console.log('完成')
				},
			})
		}
	}



	onLoad(() => {
		console.log('addStr')
		console.log(addStr)
	})
</script>

<style lang="scss">
	// 底部边框线的样式
	.address-border {
		display: block;
		width: 100%;
		height: 5px;
	}

	// 选择收货地址的盒子
	.address-choose-box {
		height: 90px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	// 渲染收货信息的盒子
	.address-info-box {
		font-size: 12px;
		height: 90px;
		display: flex;
		flex-direction: column;
		justify-content: center;
		padding: 0 5px;

		// 第一行
		.row1 {
			display: flex;
			justify-content: space-between;

			.row1-right {
				display: flex;
				align-items: center;

				.phone {
					margin-right: 5px;
				}
			}
		}

		// 第二行
		.row2 {
			display: flex;
			align-items: center;
			margin-top: 10px;

			.row2-left {
				white-space: nowrap;
			}
		}
	}
</style>
