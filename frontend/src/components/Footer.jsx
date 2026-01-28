import React from 'react';

function Footer() {
    return (
        <footer className="w-full py-4 text-center bg-gray-900 border-t border-gray-800">
            <p className="text-gray-400 text-sm">
                Made by{' '}
                <a
                    href="https://www.linkedin.com/in/sidharthprem310"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-blue-500 hover:text-blue-400 transition"
                >
                    Sidharth Prem
                </a>
            </p>
        </footer>
    );
}

export default Footer;
