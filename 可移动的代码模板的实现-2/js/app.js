(function(global,noGlobal){
    //可改进在子级container为空时添加新建按钮，点击后消失
    class StickyNote{
        //class类构造方法constructor
        constructor(options){
            this.init(options)
        }
        // 初始化
        init(options){
            //将所有可分配属性的值从多个源对象分配到目标对象
            //Object.assign(target,source)  会发生覆盖
            Object.assign(this,config,options);
            //b?x:y  b真，值为x；b假 值为y
            //如果这个id存在，则不变，否则根据时间赋值一个新id
            this.id = this.id ? this.id : new Date().getTime();
            StickyNote.top = Math.max(StickyNote.top,this.layer);  //页面最顶测
            if(!this.root){   //root不存在，赋值为body
                this.root = document.body;
            }
            //动态生成div层
            this.container = document.createElement('div');
            //存在className属性则添加，否则添加class属性为note-container
            this.container.classList.add(this.className||'note-container')
            this.root.appendChild(this.container)   //为父级添加此个container的子级
            //render()渲染函数
            this.render();
            this.bindEvent();   
        }

        save(){
            this.content = this.noteContent.innerHTML;
            //页面同步
//   StorageEvent   是一种Event，可以通过标准的Event监听器操作。
// 当storage变化时候，事件会被派发到所有同域下的其他页面。
// 触发变化的当前页面，没有事件派发。
            //存储this.id的值 为后面的
            store.set(this.id,{
                content:this.content||'',
                postTime:new Date().getTime(),
                x:this.x,
                y:this.y,
                layer:this.layer
            });
        }
        close(){  //关闭按钮
            if(this.root){     //移除但是没有删除   再次刷新为什么会显现
                this.root.removeChild(this.container);
            }
        }   
        bindEvent(){     //绑定事件
            var pos = {},self = this,canMove = false;
            //添加点击事件
            addEvent(this.titleBar, 'mousedown', function(e) {
                pos.x = e.clientX - self.container.offsetLeft;
                pos.y = e.clientY - self.container.offsetTop;
                if (e.button == 0) {
                  canMove = true;
                }
              });
              //跟踪移动
            addEvent(document, 'mousemove', function(e) {
                if (!canMove) return;
                var
                x = Math.min( document.documentElement.clientWidth - self.width, Math.max(e.clientX - pos.x, 0)),
                y = Math.min( document.documentElement.clientHeight - self.height, Math.max(e.clientY - pos.y, 0));
        
                self.container.style.left = x  + 'px';
                self.container.style.top = y + 'px';
              });
            addEvent(document,'mouseup',function(e){   //松开鼠标停止移动
                canMove=false;
            });
            addEvent(self.noteContent,'keyup',function(e){
                self.save();   //释放案件进行保存
            });
            addEvent(self.btnClose,'click',function(e){
                self.close();       //关闭按钮单击函数  保存并隐藏
                self.save();
            })
            //新建便笺绑定事件
            addEvent(self.btnNew, 'click', function(e) {
                var x = self.x,
                    y = self.y,
                    maxWidth = document.documentElement.clientWidth - self.width,
                    maxHeight = document.documentElement.clientHeight - self.height;
                //当便笺位于页面右下方时，反向生成新便笺
                //新便笺地位移单位20
                if ( x >= maxWidth || x < 0 ) {
                  vx *= -1;
                }
        
                if ( y >= maxHeight || y < 0 ) {
                  vy *= -1;
                }
        
                x = x + 20 * vx;
                y = y + 20 * vy;
                //生成一个新便笺
                new StickyNote({
                    root: self.root,
                    x: x,
                    y: y,
                    layer: StickyNote.top++
                  });
            });
            //删除按钮
            addEvent(self.btnRemove, 'click', function(e) {
                store.remove(self.id);
                self.close();
              })
            //点击便笺  
            addEvent(self.container,'mousedown',function(e){
                if(e.button!=0) return;
                self.layer = StickyNote.top++;    //上升层级
                self.container.style.zIndex = self.layer;  //赋值
            });
            //重定位结束  保存当前状态
            addEvent(self.container, 'mouseup', function(e) {
                self.x = self.container.offsetLeft || 0;
                self.y = self.container.offsetTop || 0;
                self.save();
              });
        
        }
        //动态渲染 
        render() {
            var self = this;
            //模板类地再现  正则看不懂
            self.container.innerHTML = template.replace(/\{\{([^\}]+)\}\}/g, ($0, $1) =>  self[$1]);
            self.titleBar = self.container.querySelector('.note-title');
            self.noteContent = self.container.querySelector('.note-content');
            self.btnClose = self.container.querySelector('.btn-close');
            self.btnNew = self.container.querySelector('.btn-new');
            self.btnRemove = self.container.querySelector('.btn-remove');
            self.container.style.position = 'absolute';          //位置地赋值
            self.container.style.left = self.x + 'px';
            self.container.style.top = self.y + 'px';
            self.noteContent.innerHTML = self.content;   //内容地赋值
            self.container.data = self;                 //data地赋值
            self.container.style.zIndex = self.layer;   //z轴地赋值
            self.save();
          }
        }

        StickyNote.top = 0;
        var vx = 1, vy = 1;
        const config = {
          id: null,
          root: null,
          title: '便笺',
          btnCloseTip: '关闭',
          textBtnNew: '新建笔记',
          textBtnRemove: '删除笔记',
          container: null,
          titleBar: null,
          width: 300,
          height: 400,
          x: 0,
          y: 0,
          layer: 0,
          content: '',
        };

    // 模板
  const template = [
    '<div class="note-title">',
    '   <h6>{{title}}</h6>',
    '   <a href="javascript:;" title="{{btnCloseTip}}" class="btn-close">&times;</a>',
    '</div>',
    '<div class="note-content" contenteditable="true"></div>',
    '<div class="note-footer">',
    '   <button class="btn-new">{{textBtnNew}}</button>',
    '   <button class="btn-remove">{{textBtnRemove}}</button>',
    '</div>'
  ].join('\n');
    //工具函数1
    function addEvent(el,type,fn){
        var ieType = 'on'+type;
        if('addEventListner' in window){
            //call能够使用另一个函数的方法
            addEventListener.call(el,type,fn,false);
        }else if('attachEvent' in el){
            attachEvent.call(el,ieType,fn,false);
        }else{
            el[ieType] = fn;
        }
    }
    //工具函数2
    function removeEvent(el, type, fn) {
        var ieType = 'on' + type;
        if ('removeEventListener' in window) {
          removeEventListener.call(el, type, fn, false);
        } else if ('dispatchEvent' in el) {
          el.dispatch(ieType, fn);
        } else {
          el[ieType] = null;
        }
      }
      //local存储  包含get set remove setup 对id value的操作
      const store = {
        appId: 'stickyNote',
        data: {},
        get(id) {
          return store.data ? store.data[id] : {};
        },
    
        set(id, value) {
          store.data[id] = value;
        },
    
        remove(id) {
          delete store.data[id];
        },
    
        setup() {
            try { //存储到页面
              store.data =  JSON.parse(localStorage[store.appId]) || {};
            } catch(e) {
              store.data = {};
            }
            //非空则缓存到页面
            var data = store.data;
            if ( !isEmpty(data) ) {
              for(var k in data) {
                new StickyNote({
                  root: document.body,
                  id: k,
                  x: data[k].x,
                  y: data[k].y,
                  layer: data[k].layer,
                  content: data[k].content
                });
              }
              //为空则初始化  页面中心生成空标签
            } else {  
              new StickyNote({
                root:document.body,
                x: (document.documentElement.clientWidth - config.width) / 2,
                y: (document.documentElement.clientHeight - config.height) / 2,
              });
            }
            window.onunload = function() {
              localStorage.setItem(store.appId, JSON.stringify(data));
            }
          },
          
          unsetup() {
            store.data = {};
            localStorage.removeItem(store.appId);
            window.onunload = null;
          }
        };
        //判断空
    function isEmpty(o){   //赋空值
        if (typeof o === 'string' || Array.isArray(o) ) {
            return o.length === 0;
          } else if (typeof o === 'object') {
            for(let k in o) {
              if (!o.hasOwnProperty(k)) continue;
                return false;   //如果其中一个对象有Property，返回false
            }
            return true;  //没有property，返回真
        }else{
            return o==null;
        }
    }
    //domReady 作用
    var domReady = {
        tasks: [],
        isReady: false,
        ready: function(fn) {
          domReady.tasks.push(fn);  //push
          if (domReady.isReady) {
            return domReady.completed();
          } else {
            addEvent(document, 'DOMContentLoaded', domReady.completed);
            addEvent(document, 'readystatechange', function() {
              if ( /^(?:interactive|complete)$/.test(document.readyState)) {
                domReady.completed();
                removeEvent(document, 'readystatechange', arguments.callee);
                        //callee: 返回当前函数自身的引用
                }
            });
        }
    },
    completed: function() {
      removeEvent(document, 'DOMContentLoaded', domReady.completed);
      domReady.isReady = true;
      domReady.execTasks();
    },
    execTasks: function() {
      while( domReady.tasks.length ) {
        domReady.tasks.shift()();  //移除数组第一项
      };
    }
  }
  domReady.ready(store.setup);   //store.setup缓存到页面  依次动态渲染

  window.store = store;
})();