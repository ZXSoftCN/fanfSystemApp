
import React, { Component } from 'react'
// import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { hashHistory } from 'react-router'
import { message, LocaleProvider } from 'antd'
import { validateTickit, parseQueryString } from '@configs/common'
import { loginByKey } from '@apis/common'
import zhCN from 'antd/lib/locale-provider/zh_CN'
import '@styles/base.less'

import Header from './app/header'
import LeftNav from './app/leftNav'
import TabList from './app/tabList'


@connect((state, props) => ({}))
export default class App extends Component {
  // 初始化页面常量 绑定事件方法
  constructor(props, context) {
    super(props)
    this.state = {
      isLeftNavMini: false, // 左侧导航菜单是否mini模式
      leftNav: [], // 左侧菜单列表
      topMenuReskey: 'platformManage', // 默认管理平台
      gMenuList: [], // 当前用户菜单列表
      idRenderChild: false, // 是否加载子组件
      isHideNav: false, // 是否隐藏左侧菜单
      isIframe: false, // 是否隐藏头部
    }
    // this.isLeftNavMini = this.isLeftNavMini.bind(this)
  }

  // 组件已经加载到dom中
  componentDidMount() {
    // antd的message组件 的全局配置
    message.config({
      duration: 3,
    })
  }

  componentWillMount() {
    // 初始化左侧菜单是mini模式还是正常模式
    if (sessionStorage.getItem('isLeftNavMini') === 'false') {
      this.setState({
        isLeftNavMini: false,
      })
    }
    if (sessionStorage.getItem('isLeftNavMini') === 'true') {
      this.setState({
        isLeftNavMini: true,
      })
    }
    this.init()
  }

  componentWillReceiveProps(nextProps) {

  }

  init() {
    const { query } = this.props.location//用于处理url?params1=value1&params2-=value2中的parms*
    if (query.token) { // 如果是url路径带token的话，那么在当前页面做登录的初始化
      validateTickit(this.props.location, (res) => {
        this.setState({
          idRenderChild: true,
        })
      })
    } else if (query.key) {
      const params = parseQueryString(window.location.href)
      loginByKey({ }, (res) => {
        sessionStorage.setItem('key', query.key)
        this.setState({
          idRenderChild: true,
        })
      })
    } else {
      this.setState({ gMenuList: JSON.parse(sessionStorage.getItem('gMenuList')) })
      this.getMenuId(JSON.parse(sessionStorage.getItem('gMenuList')), this.props.location.pathname.replace('/', ''))
      // 初始化比较当前的顶级菜单属于哪个
      const { topMenuReskey } = this.state
      if (topMenuReskey !== sessionStorage.getItem('topMenuReskey')) {
        this.setState({ topMenuReskey: sessionStorage.getItem('topMenuReskey') })
      }
      this.setState({
        idRenderChild: true,
        // isLeftNavMini: false,
      })
    }

    if (query.mode === 'iframe' || query.key) {
      this.setState({
        isIframe: true,
      })
    } else {
      this.setState({
        isIframe: false,
      })
    }
  }

  // 获取菜单id
  getMenuId = (nav, pathname) => {
    this.topMenuReskeyFlag = '' // 顶级菜单分类
    this.topMenuReskeyChild = [] // 顶级菜单的孩子，也就是当前要显示在左侧页面的菜单
    this.flag = false // 用来保存顶级菜单的标志
    // console.log(nav)
    if (nav && nav.length > 0) {
      this.compare(nav, pathname)
    }
  }

  // 比较方法
  compare(children, pathname) {
    children.map((item) => {
      // console.log(item.resKey)
      if (item.pathKey.indexOf('platform') > -1) {
        if (!this.flag && (sessionStorage.getItem('topMenuReskey') !== 'set$')) {
          this.topMenuReskeyFlag = item.pathKey
          this.topMenuReskeyChild = item.subMenus
        }
      }
      const _resKey = `${item.pathKey.replace(/[\$\.\?\+\^\[\]\(\)\{\}\|\\\/]/g, '\\$&').replace(/\*\*/g, '[\\w|\\W]+').replace(/\*/g, '[^\\/]+')}$`
      if (new RegExp(_resKey).test(pathname)) {
        // console.log(item.id)
        this.flag = true
        sessionStorage.setItem('menuId', item.id)
        // debugger
        sessionStorage.setItem('topMenuReskey', this.topMenuReskeyFlag)
        this.setState({ menuId: item.id, topMenuReskey: this.topMenuReskeyFlag })
        return null
      } else if (item.subMenus) {
        this.compare(item.subMenus, pathname)
      }
      return null
    })
  }

  // 左侧是否mini
  isLeftNavMini = (val) => {
    this.setState({
      isLeftNavMini: val,
    }, () => {
      sessionStorage.setItem('isLeftNavMini', val)
    })
  }

  // 顶级菜单点击事件的切换
  topMenuClick = (item, index) => {
    // console.log(item)
    if (!item.subMenus) {
      message.info('顶级菜单至少要有一个下级菜单')
      return
    }
    // sessionStorage.setItem('leftNav', JSON.stringify(item.children))
    // this.setState({ leftNav: item.children })
    sessionStorage.setItem('topMenuReskey', item.pathKey)
    this.setState({ topMenuReskey: item.pathKey })
    // if (index === 3) {
    //   this.set = true
    // } else {
    //   this.set = false
    // }

    if (item.pathKey === 'controlCenter') {
      let hasIndex = false
      item.subMenus.map((i) => {
        if (i.pathKey === 'screen$/default') {
          hasIndex = true
        }
      })
      if (hasIndex) {
        hashHistory.push(item.subMenus[0].pathKey)
      } else {
        hashHistory.push('mission$/my$')
      }
    } else if (item.subMenus[0] && item.subMenus[0] && item.subMenus[0].subMenus && item.subMenus[0].subMenus[0]) {
      hashHistory.push(item.subMenus[0].subMenus[0].pathKey)
    } else {
      hashHistory.push(item.subMenus[0].pathKey)
    }
  }

  render() {
    const { location, children } = this.props
    const {
      gMenuList, idRenderChild, isHideNav, isIframe, topMenuReskey, leftNav, isLeftNavMini,
    } = this.state
    // console.log(isIframe)
    return (
      <LocaleProvider locale={zhCN}>
        <div id="container">
          {
            idRenderChild && !isIframe ? <Header
              gMenuList={gMenuList}
              topMenuClick={this.topMenuClick}
              topMenuReskey={this.state.topMenuReskey}
            /> : null
          }

          <div className={isIframe ? 'boxed isIframe' : 'boxed'}>
            <div className={isLeftNavMini ? 'boxed boxed-mini' : 'boxed'}>
              <div id="content-container" className="content-container">
                <div id="page-content">
                  {idRenderChild ? children : null}
                </div>
              </div>
            </div>
            {
              idRenderChild ?
                <LeftNav
                  location={location}
                  leftNavMode={this.isLeftNavMini}
                  leftNav={leftNav}
                  topMenuReskey={topMenuReskey}
                /> : null
            }
          </div>
        </div>
      </LocaleProvider>
    )
  }
}
