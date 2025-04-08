import style from './accessDenied.module.scss'

const AccessDenied = () => (
    <div className={style.denied}>
        <div className={style.lock}></div>
        <div className={style.message}>
            <h1>Access to this page is restricted</h1>
            <p>Please check with the site admin if you believe this is a mistake.</p>
        </div>
    </div>
)
export default AccessDenied;