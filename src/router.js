import Vue from 'vue'
import Router from 'vue-router'
import firebase from './firebase'

Vue.use(Router)

let router = new Router({
    mode: 'history',
    base: process.env.BASE_URL,
    routes: [
        {
            path: '/',
            name: 'home',
            component: () => import('./views/AllBooks'),

        },
        {
            path: '/my-books',
            name: 'myBooks',
            component: () => import('./views/MyBooks'),
            meta: {
                requiresAuth: true
            }
        },
        {
            path: '/trash',
            name: 'trash',
            component: () => import('./views/TrashBooks'),
            meta: {
                requiresAuth: true
            }
        },

        {
            path: '/book/:id',
            name: 'book',
            component: () => import('./views/SingleBook'),
            meta: {
                requiresAuth: true
            }
        },
        {
            path: '/signin',
            name: 'signin',
            component: () => import('./views/Signin'),
            meta: {
                requiresGuest: true
            }

        },
        // {
        //     path: '/signup',
        //     name: 'sigup',
        //     component: () => import('./views/Signup'),
        //     meta: {
        //         requiresGuest: true
        //     }


        // }

    ]
});

//Guards

router.beforeEach((to, from, next) => {
    if(to.matched.some( record => record.meta.requiresAuth)){
        //if not loggedin
        if(!firebase.auth.currentUser){
            //if not logged in
            next({
                path: '/signin',
                query:{
                    redirect: to.fullPath
                }
            })
        }else{
            // proceed to route
            next()
        }
    }else if(to.matched.some( record => record.meta.requiresGuest)){
        //if logge in already
        if(firebase.auth.currentUser){
            next({
                path: '/',
            })
        }else{
            // proceed to route
            next()
        }
    }
    else{
        // proceed to route
        next()
    }
})

export default router;