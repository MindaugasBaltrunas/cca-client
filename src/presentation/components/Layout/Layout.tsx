import React from 'react';
import style from './layout.module.scss';
import Sidebar from '../Sidebar/Sidebar';
import Footer from '../Footer/Footer';

type LayoutProps = {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }: LayoutProps) => {
    return (
        <div className={style.layout}>
            <Sidebar />
            <div className={style.content}>
                {children}
            </div>
            <Footer />
        </div>
    );
};

export default Layout;