<template>
	<view>
		<view class="login-container">
			<!-- 提示登录的图标 -->
			<uni-icons type="contact-filled" size="100" color="#AFAFAF"></uni-icons>
			<!-- 登录按钮 -->
			<button open-type="getUserInfo" @getuserinfo="getUserInfo" type="primary" class="btn-login">一键登录</button>
			<!-- 登录提示 -->
			<view class="tips-text">登录后尽享更多权益</view>
		</view>
	</view>
</template>

<script setup lang="ts">
	import {
		// ref,
		// reactive,
		// computed,
		// watch,
		// PropType
	} from 'vue'

	import {
		storeToRefs
	} from 'pinia'
	import {
		userAddress
	} from '../../pinia/user';
	import {
		onShow
	} from '@dcloudio/uni-app'



	const props = defineProps({
		bColor: {
			type: String,
			default: '#c00000'
		},
		raius: {
			type: Number,
			default: 18
		},
		list: new Array
	})


	const {
		updateUserInfo,
		updateToken,
		updateRedirectInfo
	} = userAddress();
	const {
		redirectInfo
	} = storeToRefs(userAddress())

	const emit = defineEmits(['mySearchClick'])

	const getUserInfo = (e: any) => {
		console.log(e)
		// 判断是否获取用户信息成功
		if (e.detail.errMsg === 'getUserInfo:fail auth deny') {
			return uni.$showMsg('您取消了登录授权！')
		}

		// 获取用户信息成功， e.detail.userInfo 就是用户的基本信息
		console.log(e.detail.userInfo)
		updateUserInfo(e.detail.userInfo)

		// 获取登录成功后的 Token 字符串
		getToken(e.detail)
	}

	// 调用登录接口，换取永久的 token
	const getToken = async (info: any) => {
		// 调用微信登录接口
		const [err, res] = await uni.login({})
		// 判断是否 uni.login() 调用失败
		if (err || res.errMsg !== 'login:ok') return uni.$showError('登录失败！')

		// 准备参数对象
		const query = {
			code: res.code,
			encryptedData: info.encryptedData,
			iv: info.iv,
			rawData: info.rawData,
			signature: info.signature
		}

		// 换取 token
		const {
			data: loginResult
		} = await (uni as any).$http.post('/api/public/v1/users/wxlogin', query)
		if (loginResult.meta.status !== 200) return uni.$showMsg('登录失败！')
		uni.$showMsg('登录成功')

		updateToken(loginResult.message.token)


		// 判断 pinia 中的 redirectInfo 是否为 null
		// 如果不为 null，则登录成功之后，需要重新导航到对应的页面
		navigateBack()
	}

	// 返回登录之前的页面
	function navigateBack() {
		// redirectInfo 不为 null，并且导航方式为 switchTab
		if (redirectInfo && redirectInfo.value?.openType === 'switchTab') {
			// 调用小程序提供的 uni.switchTab() API 进行页面的导航
			uni.switchTab({
				// 要导航到的页面地址
				url: redirectInfo.value.from || '',
				// 导航成功之后，把  redirectInfo 对象重置为 空
				complete: () => {
					updateRedirectInfo({})
				}
			})
		}
	}



	onShow(() => {
		console.log(props)
	})
</script>

<style lang="scss">
	.login-container {
		// 登录盒子的样式
		height: 750rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background-color: #f8f8f8;
		position: relative;
		overflow: hidden;

		// 绘制登录盒子底部的半椭圆造型
		&::after {
			content: ' ';
			display: block;
			position: absolute;
			width: 100%;
			height: 40px;
			left: 0;
			bottom: 0;
			background-color: white;
			border-radius: 100%;
			transform: translateY(50%);
		}

		// 登录按钮的样式
		.btn-login {
			width: 90%;
			border-radius: 100px;
			margin: 15px 0;
			background-color: #c00000;
		}

		// 按钮下方提示消息的样式
		.tips-text {
			font-size: 12px;
			color: gray;
		}
	}
</style>
