import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import StaggeredMenu from "./StaggeredMenu"
import { logout } from "../store/slices/authSlice"
import GameSearchModal from "./GameSearchModal"
import UserSearchModal from "./UserSearchModal"

const Navigation = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { isAuthenticated, user } = useSelector((state) => state.auth)
  const [showSearchModal, setShowSearchModal] = useState(false)
  const [showUserSearchModal, setShowUserSearchModal] = useState(false)

  const handleLogout = () => {
    dispatch(logout())
    navigate("/")
  }

  // Prepara gli items del menu in base all'autenticazione
  const menuItems = []

  if (isAuthenticated) {
    menuItems.push({
      label: "Home",
      ariaLabel: "Go to home page",
      component: Link,
      to: "/",
    })
    menuItems.push({
      label: "My Games",
      ariaLabel: "Go to my games profile",
      component: Link,
      to: `/profile/${user?.id}`,
    })
    menuItems.push({
      label: "Search Game",
      ariaLabel: "Search for a game",
      onClick: () => setShowSearchModal(true),
    })
    menuItems.push({
      label: "Search Users",
      ariaLabel: "Search for users",
      onClick: () => setShowUserSearchModal(true),
    })
    menuItems.push({
      label: "Logout",
      ariaLabel: "Logout",
      onClick: handleLogout,
    })
  } else {
    menuItems.push({
      label: "Home",
      ariaLabel: "Go to home page",
      component: Link,
      to: "/",
    })
    menuItems.push({
      label: "Login",
      ariaLabel: "Login to your account",
      component: Link,
      to: "/login",
    })
    menuItems.push({
      label: "Register",
      ariaLabel: "Create a new account",
      component: Link,
      to: "/register",
    })
  }

  return (
    <>
      <StaggeredMenu
        position="right"
        items={menuItems}
        socialItems={[]}
        displaySocials={false}
        displayItemNumbering={true}
        menuButtonColor="#e9f1ff"
        openMenuButtonColor="#00e5ff"
        accentColor="#00e5ff"
        colors={["rgba(17, 0, 255, 0.95)", "rgba(10, 10, 59, 0.98)"]}
        logoUrl="/logo scorebtw.png"
        changeMenuColorOnOpen={true}
        isFixed={true}
        className="staggered-nav"
      />
      <GameSearchModal
        show={showSearchModal}
        onHide={() => setShowSearchModal(false)}
      />
      <UserSearchModal
        show={showUserSearchModal}
        onHide={() => setShowUserSearchModal(false)}
      />
    </>
  )
}

export default Navigation
