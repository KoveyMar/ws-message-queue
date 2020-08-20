/**
 *	@author [author]
 *	@version [version]
 *	@description module notification
 * 
 */
import Log from './log';
import { isObject, isEmptyObject } from './utils';
export default class notification {
	/**
	 * [constructor description]
	 * @attribute [noticeOptions] 	实例对象接收配置
	 * @attribute [options]			默认配置参数
	 * @attribute [autoClose]		是否自动关闭
	 * @return {[type]} [description]
	 */
	constructor(){
		this.ntf = null;
		this.title = '新的socket消息';
		this.noticeOptions = {};
		this.options = {
			dir: 'auto',
			lang: 'zh-cn',
			badge: '',
			body: '',
			tag: '',
			icon: '',
			image: '',
			data: '',
			vibrate: '',
			renotify: !1,
			requireInteraction: !1
		};
		this.autoClose = !0;
    	this.done = this.done.bind(this);
    	this.fail = this.fail.bind(this);
    	this.show = this.show.bind(this);
    	this.click = this.click.bind(this);
    	this.close = this.close.bind(this);
    	this.error = this.error.bind(this);
	}
	/**
	 * @description 实例初始化成功回调
	 * @return {Function}
	 */
	done(){}
	/**
	 * @description 实例初始化失败回调
	 * @return {[type]}
	 */
	fail(){}
	/**
	 * @description 通知显示时，实例回调
	 * @return {[type]}
	 */
	show(){}
	/**
	 * @description 点击通知时，实例回调
	 * @return {[type]}
	 */
	click(){}
	/**
	 * @description 关闭通知时，实例回调
	 * @return {[type]}
	 */
	close(){}
	/**
	 * @description 发送错误时，实例回调
	 * @return {[type]}
	 */
	error(){}
	/**
	 * @description 关闭事件
	 * @return {[type]}
	 */
	closeEvt(){
		this.ntf.onclose = () => {
			this.close();
		}
	}
	/**
	 * @description 错误事件
	 * @return {[type]} [description]
	 */
	errorEvt(){
		this.ntf.onerror = (e) => {
			this.error(e);
		}
	}
	/**
	 * @description 点击事件
	 * @return {[type]} [description]
	 */
	clickEvt(){
		this.ntf.onclick = (e) => {
			e.preventDefault();
			this.click();
		} 
	}
	/**
	 * 显示弹窗事件
	 * @return {[type]} [description]
	 */
	showEvt(){
		this.ntf.onshow = () => {
			this.show();
			this.autoClose && setTimeout( () => {
				this.ntf.close();
			}, 4000);
		}
	}
	/**
	 * @description 事件分发
	 */
	stateDispatch(){
		this.closeEvt();
		this.errorEvt();
		this.clickEvt();
		this.showEvt();
	}
	/**
	 * @param  notice {Object} { dir: 'auto', lang: '', tag: 'ID', body: 'body', icon: 'URL'}
	 * @return {[type]}
	 */
	init(notice){
		if ( !("Notification" in window) ) {
			return Log.warn( `Your Browser Does Not Support Desktop Notification` );
		}

		isEmptyObject(notice) && Log.warn( `Notification Resovle Default Options` );

		if ( isObject(notice) ) {
			Log.warn(`Notification Resovle Options`);
			this.noticeOptions = notice;
			this.title = notice.title || '新的socket消息';
			this.options = notice.options || this.options;
			this.autoClose = !isEmptyObject(notice.autoClose) ? notice.autoClose : !0;
			this.done = notice.done || new Function();
			this.fail = notice.fail || new Function();
			this.close = notice.OnClose || new Function();
			this.show = notice.OnShow || new Function();
			this.click = notice.OnClick || new Function();
			this.error = notice.OnError || new Function();
		}
		(Notification.permission === 'denied' || Notification.permission === 'default') && Notification.requestPermission();
	}
	showNotification( options = {} ){

		let _options = {
			...this.options,
			...options
		};
		if ( Notification.permission === 'granted' ) {
			this.ntf = new Notification( this.title, _options );
			this.done();
			this.stateDispatch();
		}
		else if ( Notification.permission === 'denied' || Notification.permission === 'default' ) {
			Notification.requestPermission()
			.then( res => {
				Log.warn(`Notification Has Been Allowed Work`);
				if ( res === 'granted' ) {
					this.ntf = new Notification( this.title, _options );
					this.done();
					this.stateDispatch();			
				}

			})
			.catch( err => {
				Log.warn( `Notification Could Not Resovle` );
				this.fail();
			});
		}
	}
}