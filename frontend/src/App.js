import React, {Suspense} from 'react'
import {BrowserRouter as Router, Route, Routes, Navigate} from "react-router-dom"


// import Users from "./user/pages/Users"
// import NewPlace from "./places/pages/NewPlace"
// import UserPlaces from "./places/pages/UserPlaces"
// import UpdatePlace from "./places/pages/UpdatePlace"
// import Auth from "./user/pages/Auth"
import MainNavigation from "./shared/components/Navigation/MainNavigation"
import {AuthContext} from "./shared/context/auth-context"
import {useAuth} from "./shared/hooks/auth-hook"
import LoadingSpinner from "./shared/components/UIElements/LoadingSpinner"

const Users = React.lazy(() => import('./user/pages/Users'))
const NewPlace = React.lazy(() => import('./places/pages/NewPlace'))
const UserPlaces = React.lazy(() => import('./places/pages/UserPlaces'))
const UpdatePlace = React.lazy(() => import('./places/pages/UpdatePlace'))
const Auth = React.lazy(() => import('./user/pages/Auth'))


const App = () => {

    const {token, login, logout, userId} = useAuth()

    let routes
    if (token) {
        routes = (
            <Routes>
                <Route path="/" element={<Users/>} exact/>
                <Route path="/:userId/places" element={<UserPlaces/>} exact/>
                <Route path="/places/new" element={<NewPlace/>} exact/>
                <Route path="/places/:placeId" element={<UpdatePlace/>} exact/>
                <Route path="*" element={<Navigate to="/"/>}/>
            </Routes>
        )
    } else {
        routes = (
            <Routes>
                <Route path="/" element={<Users/>} exact/>
                <Route path="/:userId/places" element={<UserPlaces/>} exact/>
                <Route path="/auth" element={<Auth/>} exact/>
                <Route path="*" element={<Navigate to="/auth"/>}/>
            </Routes>
        )
    }

    return (
        <AuthContext.Provider value={{
            isLoggedIn: !!token,
            token: token,
            userId: userId,
            login: login,
            logout: logout
        }}>
            <Router>
                <MainNavigation/>
                <main>
                    <Suspense fallback={
                        <div className="center">
                            <LoadingSpinner/>
                        </div>
                    }>
                        {routes}
                    </Suspense>
                </main>
            </Router>
        </AuthContext.Provider>
    )
}

export default App
