import Head from 'next/head';

export default function Home({ backendStatus, timestamp }) {
    return (
        <div style={{ padding: '2rem', fontFamily: 'sans-serif', backgroundColor: '#111827', color: 'white', minHeight: '100vh' }}>
            <Head>
                <title>AuthNexus SSR</title>
            </Head>

            <main>
                <h1>AuthNexus SSR Portal</h1>
                <p>This page is server-side rendered.</p>

                <div style={{ marginTop: '2rem', padding: '1rem', border: '1px solid #374151', borderRadius: '8px' }}>
                    <h2>Server Status Check</h2>
                    <p><strong>Backend URL:</strong> http://127.0.0.1:5008</p>
                    <p><strong>Status:</strong> <span style={{ color: backendStatus === 'Online' ? '#4ade80' : '#f87171' }}>{backendStatus}</span></p>
                    <p><strong>Server Time:</strong> {timestamp}</p>
                </div>
            </main>
        </div>
    );
}

export async function getServerSideProps() {
    let backendStatus = 'Offline';
    let timestamp = new Date().toISOString();

    try {
        // Attempt to fetch swagger docs as a health check
        const res = await fetch('http://127.0.0.1:5008/apidocs/index.html');
        if (res.status === 200) {
            backendStatus = 'Online';
        }
    } catch (e) {
        backendStatus = 'Offline (Connection Refused)';
    }

    return {
        props: {
            backendStatus,
            timestamp
        },
    };
}
