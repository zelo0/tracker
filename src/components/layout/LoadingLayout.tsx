import { Spin } from "antd";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";


export default function LoadingLayout({children} : {children: React.ReactNode}) {

  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    router.events.on("routeChangeError", (e) => setLoading(false));
    router.events.on("routeChangeStart", (e) => setLoading(true));
    router.events.on("routeChangeComplete", (e) => setLoading(false));

    return () => {
      router.events.off("routeChangeError", (e) => setLoading(false));
      router.events.off("routeChangeStart", (e) => setLoading(true));
      router.events.off("routeChangeComplete", (e) => setLoading(false));
    };
  }, [router.events]);


  return (
    <>
    {/* loading */}
    {
      loading 
      &&
      (
      <div style={{
        position: 'fixed', 
        width: '100%', 
        height: '100%', 
        backgroundColor: 'rgba(0, 0, 0, 0.4)', 
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <Spin 
          tip="로딩 중"
          size="large" 
          style={{

          }}
        />
      </div>
      )
    }
      
    {children}
    </>
  )
}