import React, { Component } from 'react'
import { connect } from 'react-redux'
import { hashHistory, Link } from 'react-router'
// import { routerActions } from 'react-router-redux'
import { Menu, Icon, Spin } from 'antd'
import { updateTabList } from '@actions/tabList'
import { clearGformCache2 } from '@actions/common'
import { workBench } from '@config'

const { SubMenu } = Menu

@connect((state, props) => ({
  config: state.config,
}))
export default class LeftNav extends Component {
  constructor(props, context) {
    super(props, context)

    const { pathname } = props.location
    this.state = {
      current: pathname,
      openKeys: ['sub1'],
      isLeftNavMini: false,
      collapsed: false,
    }

    this._handleToggle = this._handleToggle.bind(this)
    this.navMini = this.navMini.bind(this)
    this.renderLeftNav = this.renderLeftNav.bind(this)
  }

  componentWillMount() {
    // 初始化左侧菜单是mini模式还是正常模式
    if (sessionStorage.getItem('isLeftNavMini') === 'false') {
      this.setState({
        isLeftNavMini: false,
        collapsed: false,
      })
    }
    if (sessionStorage.getItem('isLeftNavMini') === 'true') {
      this.setState({
        isLeftNavMini: true,
        collapsed: true,
      })
    }
    this.openKeys(this.props.location.pathname)
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.topMenuReskey !== nextProps.topMenuReskey) {
      // this.openKeys()
    }
    // console.log(this.props.location.pathname)
    // console.log(nextProps.location.pathname)
    if (this.props.location.pathname !== nextProps.location.pathname) {
      this.openKeys(nextProps.location.pathname)
    }
  }

  // 确认当前要打开的菜单
  openKeys = (pathname) => {
    // /*
    // **下面这一整段代码，是为了获取当前菜单是哪个，要默认打开这个一级菜单, 只遍历两层结构
    // */
    const navList = JSON.parse(sessionStorage.getItem('leftNav')) || []
    // console.log(navList)
    const curPath = `${pathname.split('$')[0]}`.replace('/', '')
    let len = 0
    let curSub
    navList.map((item, index) => {
      // console.log(item.resKey)
      if (item.subMenus && item.subMenus.length > 0) {
        len++
      }
      if (item.pathKey && curPath === item.pathKey.split('$')[0].replace('/', '')) {
        curSub = len
      } else if (item.subMenus && item.subMenus.length > 0) {
        item.subMenus.map((record) => {
          if (item.pathKey && curPath === record.pathKey.split('$')[0].replace('/', '')) {
            curSub = len
          }
        })
      }
    })
    this.setState({
      openKeys: [`sub${curSub - 1}`],
    })
  }

  // 菜单点击事件
  _handleClick = (e) => {
    this.props.dispatch(clearGformCache2({}))
    hashHistory.push(`/${e.key}`)
  }

  _handleToggle = (openKeys) => {
    const { state } = this;
    const latestOpenKey = openKeys.find(key => !(state.openKeys.indexOf(key) > -1));
    const latestCloseKey = state.openKeys.find(key => !(openKeys.indexOf(key) > -1));

    let nextOpenKeys = [];
    if (latestOpenKey) {
      nextOpenKeys = this.getAncestorKeys(latestOpenKey).concat(latestOpenKey);
    }
    if (latestCloseKey) {
      nextOpenKeys = this.getAncestorKeys(latestCloseKey);
    }
    this.setState({ openKeys: nextOpenKeys });
  }

  getAncestorKeys = (key) => {
    const map = {
      // sub3: ['sub2'],
    };
    return map[key] || [];
  }

  // 左侧菜单切换显示模式
  navMini = () => {
    this.setState({
      isLeftNavMini: !this.state.isLeftNavMini,
      collapsed: !this.state.collapsed,
    }, () => {
      // console.log(this.state.isLeftNavMini)
      this.props.leftNavMode(this.state.isLeftNavMini)
    })
  }

  // 二级菜单的生成
  renderLeftNav(options) {
    const self = this
    const subMenus = JSON.parse(sessionStorage.getItem('leftNav')) || []
    return subMenus.map((item, index) => {
      if (!item.subMenus || item.subMenus.length === 0) {
        return (
          <Menu.Item key={item.pathKey ? item.pathKey : item.id} name={item.name} style={{ paddingLeft: 0 }}>
            <i className={`qqbicon qqbicon-${item.iconClassName}`} title={item.name} />
            <span className="menu-name">{item.name}</span>
          </Menu.Item>
        )
      }
      return (
        <SubMenu key={`sub${index}`}
          title={
            <span>
              <Icon type="caret-down" title={item.name} />
              <span className="menu-name">{item.name}</span>
            </span>
          }
        >
          {
            item.subMenus.map((child, _index) =>
              (
                <Menu.Item key={child.pathKey ? child.pathKey : child.id} name={child.name}>
                  <i className={`qqbicon qqbicon-${child.iconClassName}`} title={child.name} />
                  <span className="menu-name">{child.name}</span>
                </Menu.Item>
              ))
          }
        </SubMenu>
      )
    })
  }

  // 左侧菜单高亮的控制
  leftMenuHighLight = () => {
    const { pathname } = this.props.location
    let selectedKeys = [pathname.replace('/', '')]
    // let selectedKeys = [`${this.props.location.pathname.split('$')[0]}$`.replace('/', '')]
    if (pathname.indexOf(`${workBench}/labelCloud`) > -1) { // 标签云台
      selectedKeys = [`${workBench}/labelCloud`]
    }
    return selectedKeys
  }

  render() {
    return (
      <div className={this.state.isLeftNavMini ? 'LeftNavMini' : ''}>
        <nav id="mainnav-container" className="mainnav-container">
          <div className="LeftNav-control" onClick={() => this.navMini()}>
            <i className="qqbicon qqbicon-navcontrol" />
          </div>
          <Spin spinning={false}>
            <Menu onClick={this._handleClick}
              theme="dark"
              openKeys={this.state.openKeys}
              onOpenChange={this._handleToggle}
              selectedKeys={this.leftMenuHighLight()}
              mode="inline"
              inlineIndent="16"
              inlineCollapsed={this.state.collapsed}
            >
              {this.renderLeftNav()}
            </Menu>
          </Spin>
        </nav>
      </div>
    )
  }
}
