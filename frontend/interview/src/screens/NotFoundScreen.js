import React from 'react';
import GradientButton from "../components/GradientButton";
import GradientText from "../components/GradientText";
import Header from "../layout/Header";
import Content from "../layout/Content";
import Layout from "../layout/Layout";
import { CONFIG } from '../commons/config';

function BaseNotFoundScreen(props) {
  return (
    <div className='flex flex-col h-screen w-full'>
      <section className="">
        <div className="py-[15vh] px-4 mx-auto max-w-screen-xl">
          <div className="mx-auto max-w-screen-sm text-center">
            <div className='flex flex-row text-[8rem] font-extrabold mx-auto justify-center'>
              <GradientText text='404' />
            </div>
            <p className="mb-4 text-3xl tracking-tight font-bold text-gray-900 md:text-4xl dark:text-white">Something's
              missing.</p>
            <p className="mb-4 text-lg font-light text-gray-500 dark:text-gray-400">Sorry, we can't find that page.
              You'll find lots to explore on the home page. </p>
            <div className='flex flex-row w-[40%] mx-auto'>
              <GradientButton text='Goto Home' onClick={() => window.location.href = CONFIG.AUTH_FRONTEND_URL} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function NotFoundScreen(props) {
  return (
    <Layout className='flex flex-col h-screen w-full overflow-y-hidden'>
      <Header />

      <Content>
        <BaseNotFoundScreen />
      </Content>
    </Layout>
  );
}

export default NotFoundScreen;
