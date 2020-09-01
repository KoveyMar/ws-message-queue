/**
 *  @author [author]
 *  @version 1.0
 *  @description websocket and pormise resolve
 * 
 */
import Queue from './components/queue';
import Notify from './components/notification';
import Log from './components/log';
import Utils from './components/utils';
export default class SocketQueue {

  constructor(){
    this.socket = null;
    this.queue = null;
    this.nfc = null;
    this.url = null;
    this.retime = 5;
    this.protocol = null;
    this.WSState = null;
    this.noticeOptions = null;
    this.resolveConnect = !1;
    this.resolveConnectTime = 5;
    this.open = this.open.bind(this);
    this.closed = this.closed.bind(this);
    this.error = this.error.bind(this);
    this.send = this.send.bind(this);
    this.reConnect = this.reConnect.bind(this);
    this.getData = this.getData.bind(this);
    this.destroy = this.destroy.bind(this);
    this.initWSocket = this.initWSocket.bind(this);
    this.rebuildSocket = this.rebuildSocket.bind(this);
  }
  /**
   * @description 建立WS连接后
   * @return {[type]}
   */
  open(){}
  /**
   * @description 连接关闭后
   * @return {[type]}
   */
  closed(e){}
  /**
   * @description 断线重连回调
   * @param  {[type]} number [次数]
   * @return {[type]}        [description]
   */
  reConnect(number){}
  /**
   * @description 发送WS数据
   * @param  {[type]}
   * @return {[type]}
   */
  send(data, fun = () => {}){
    this.WSState === 1 && (
      this.socket.send(data),
      fun()
    );
  }
  /**
   * @description 获取接受的第一条队列数据
   * @return 返回队列的第一条数据
   */
  getData(){
    return this.queue.next();
  }
  /**
   * @description 发送错误时回调
   * @return {[type]}
   */
  error(err){}
  /**
   * @description 销毁当前WS调用实例
   * @return {[type]}
   */
  destroy(){
    this.socket && this.socket.close();
    this.socket = null;
    this.queue = null;
    this.nfc = null;
    this.url = null;
    this.retime = 5;
    this.protocol = null;
    this.WSState = null;
    this.noticeOptions = null;
    this.resolveConnect = !1;
    this.resolveConnectTime = 5;
  }
  /**
   * @description 创建WEBSOCKET对象
   * @return {[type]} [description]
   */
  initWSocket(){
    try {
      this.socket = new WebSocket( this.url, this.protocol );
      Log.Info('WebSocket is created');

      this.socket.onopen = (e) => {
        Log.Info('WebSocket is connect!');
        Log.Info('WebSocket is open!');
        const time = this.retime;
        this.resolveConnect = !1;
        this.resolveConnectTime = time;
        this.WSState = e.target.readyState;
        this.open(e);
      }

      this.socket.onmessage = (evt) => {
        // console.log('%O', evt)
        const data = evt.data;
        const options = {
          body: data
        };
        // this.queue.add( { data: data, response: evt } );
        this.queue.add( data );
        this.nfc.showNotification(options);
        Log.Info(`WebSocket status '${evt.type}', New Message - ${data}`);
      }

      this.socket.onerror = (err) => {
        Log.Error(`WebSocket status '${err.type}' - ${err.reason}`);
        // console.log('%O', err)
        this.WSState = err.target.readyState;
        this.rebuildSocket(err.type);
        this.error( err );
      }

      this.socket.onclose = (evt) => {
        Log.Warn(`WebSocket status '${evt.type}' - ${evt.reason}`);
        // console.log('%O', evt)
        this.WSState = evt.target.readyState;
        this.rebuildSocket(evt.type);
        this.closed( evt );
      }

      this.queue = new Queue();
      this.nfc = new Notify();
      this.nfc.init(this.noticeOptions);
    }
    catch ( e ) {
      Log.Error( e );
    }
  }
  /**
   * @description 断线重连
   * @return {[type]}
   */
  rebuildSocket(service){
    if (this.resolveConnect) return;
    
    this.resolveConnect = !0;

    let timer = null;

    const FN = (num) => {
      return new Promise( ( resolve, reject ) => {
        Log.Info(`WebSocket trying to reconnect...`);
        timer = setTimeout( () => {
          Log.Info( `WebSocket reconnect from ${service}, state ${this.WSState}, in ${num} connect WebSocket` );
          this.initWSocket();
          this.reConnect(num);
          this.resolveConnect = !1;
          resolve();
        }, 5000);
      });
    };

    this.resolveConnect && this.resolveConnectTime > 0 && FN(this.resolveConnectTime).then( () => { clearTimeout(timer); });

    this.resolveConnectTime--;

  }
  /**
   * [init description]
   * @param  {Object} options [description]
   * @return {[type]}         [description]
   */
  init( options = {} ){
    if ( !('WebSocket' in window) ) {
      return Log.Warn(`Your Browser Dose Not Support WebSocket`);
    }
    if ( Utils.isEmptyObject(options) ) {
      return Log.Error(`WebSocket Can't Resolve Empty Options`);
    }

    const socket = options.socket;
    
    this.noticeOptions = options.notice;

    if ( Utils.isObject( socket ) ) {
      const T = socket.retime;
      let temp_time = 0;
      this.url = socket.url;
      this.protocol = socket.protocol;
      this.retime = Utils.isNumber(T) && T <= 5 ? T : 5;
      temp_time = this.retime;
      this.resolveConnectTime = temp_time;
      this.open = Utils.isFunction(socket.open) ? socket.open : new Function();
      this.closed = Utils.isFunction(socket.closed) ? socket.closed : new Function();
      this.error = Utils.isFunction(socket.error) ? socket.error : new Function();
    }

    Utils.isString( socket ) && (this.url = socket);

    !Utils.isString(this.protocol) && Utils.throwType(this.protocol, 'protocol', { string: Utils.isString });

    if ( Utils.isEmptyObject(this.url) ) {
      return Log.Error(`WebSocket'url is empty`);
    }
    
    this.initWSocket();
  }
}