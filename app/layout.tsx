import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import Script from "next/script"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Vido Study — Smart YouTube Learning",
  description: "Transform YouTube videos into organized study materials with notes, moments, and beautiful folders",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon-512x512.png",
    apple: "/apple-icon.png",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          {children}
          <Toaster />
        </ThemeProvider>
        {/* Ad widget container */}
        <div
          id="pygen-ad-widget"
          style={{ position: "fixed", bottom: "20px", left: 0, right: 0, zIndex: 9999, pointerEvents: "none" }}
        ></div>
        {/* Ad script */}
        <Script id="pygen-ad-script" strategy="afterInteractive">
          {`
          (function() {
              const apiUrl = 'https://script.google.com/macros/s/AKfycbw4xasjsYM_1ycT3a1DCq9dDm-IBpOLHd5xeu_xo6UL_76XgBJstBAMzHCbWInZTugq/exec';
              const SESSION_KEY = 'pygen_ad_closed';
              
              // Function to check if ad is closed for this session
              function isAdClosedForSession() {
                  return sessionStorage.getItem(SESSION_KEY) === 'true';
              }
              
              // Function to mark ad as closed for this session
              function markAdClosedForSession() {
                  sessionStorage.setItem(SESSION_KEY, 'true');
              }
              
              // Function to close the ad
              function closeAd() {
                  const adWidget = document.getElementById('pygen-ad-widget');
                  if (adWidget) {
                      adWidget.style.display = 'none';
                      markAdClosedForSession();
                  }
              }
              
              // Function to fetch and display ad
              function fetchAd() {
                  // Check if ad is closed for this session
                  if (isAdClosedForSession()) {
                      return; // Don't show ad if closed for this session
                  }
                  
                  // Get the widget container
                  const adWidget = document.getElementById('pygen-ad-widget');
                  
                  // Show loading state
                  adWidget.innerHTML = \`
                      <div style="max-width: 800px; margin: 0 auto; pointer-events: auto;">
                          <div style="background-color: white; border: 1px solid #f0f0f0; border-radius: 16px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08); padding: 20px; text-align: center;">
                              <div style="display: inline-block; width: 30px; height: 30px; border: 3px solid rgba(0, 0, 0, 0.1); border-radius: 50%; border-top-color: #000; animation: pygen-spin 1s linear infinite;"></div>
                          </div>
                      </div>
                  \`;
                  
                  // Define the animation and responsive styles
                  if (!document.getElementById('pygen-spinner-style')) {
                      const styleEl = document.createElement('style');
                      styleEl.id = 'pygen-spinner-style';
                      styleEl.textContent = \`
                          @keyframes pygen-spin { to { transform: rotate(360deg); } }
                          
                          /* Responsive styles for the ad widget */
                          @media (max-width: 768px) {
                              #pygen-ad-widget .ad-container {
                                  padding: 16px !important;
                                  margin: 0 10px !important;
                              }
                              
                              #pygen-ad-widget .ad-title {
                                  font-size: 16px !important;
                              }
                              
                              #pygen-ad-widget .ad-description {
                                  font-size: 14px !important;
                              }
                              
                              #pygen-ad-widget .ad-button {
                                  padding: 7px 16px !important;
                                  font-size: 13px !important;
                              }
                              
                              #pygen-ad-widget .content-wrapper {
                                  gap: 8px !important;
                              }
                              
                              #pygen-ad-widget .title-button-row {
                                  flex-direction: column !important;
                                  align-items: flex-start !important;
                              }
                              
                              #pygen-ad-widget .ad-button-wrapper {
                                  margin-top: 8px !important;
                              }
                          }
                      \`;
                      document.head.appendChild(styleEl);
                  }
                  
                  // Use JSONP to avoid CORS issues
                  const script = document.createElement('script');
                  const callbackName = 'pygenCallback_' + Math.random().toString(36).substr(2, 9);
                  
                  window[callbackName] = function(data) {
                      // If there's an error or status is expired, don't show anything
                      if (data.error || data.status === 'expired') {
                          // Clear the widget content completely
                          adWidget.innerHTML = '';
                          return;
                      }
                      
                      // Extract button text from link if available
                      const urlParts = data.link.split('/');
                      const buttonText = data.buttonText || urlParts[urlParts.length - 1] || 'Visit';
                      
                      // Improved widget with responsive design
                      adWidget.innerHTML = \`
                          <div style="max-width: 800px; margin: 0 auto; pointer-events: auto;">
                              <div class="ad-container" style="background-color: white; border: 1px solid #f0f0f0; border-radius: 16px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08); padding: 20px; position: relative;">
                                  <!-- Close button with session storage -->
                                  <button onclick="(function() { 
                                          document.getElementById('pygen-ad-widget').style.display='none'; 
                                          sessionStorage.setItem('pygen_ad_closed', 'true');
                                      })();" 
                                      style="position: absolute; top: 10px; right: 10px; background: none; border: none; cursor: pointer; color: #999; 
                                             width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; 
                                             transition: background-color 0.2s ease;"
                                      onmouseover="this.style.backgroundColor='#f5f5f5'" 
                                      onmouseout="this.style.backgroundColor='transparent'">
                                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                          <line x1="18" y1="6" x2="6" y2="18"></line>
                                          <line x1="6" y1="6" x2="18" y2="18"></line>
                                      </svg>
                                  </button>
                                  
                                  <!-- Content wrapper -->
                                  <div class="content-wrapper" style="display: flex; flex-direction: column; gap: 10px;">
                                      <!-- Title and button row -->
                                      <div class="title-button-row" style="display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-right: 20px;">
                                          <h3 class="ad-title" style="font-size: 18px; font-weight: 600; margin: 0; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #111;">\${data.title}</h3>
                                          
                                          <!-- Button wrapper to ensure it stays below title on mobile -->
                                          <div class="ad-button-wrapper">
                                              <a href="\${data.link}" 
                                                 class="ad-button"
                                                 style="display: inline-block; background-color: #000; color: white; text-decoration: none; 
                                                        padding: 8px 20px; border-radius: 30px; font-size: 14px; font-weight: 500; 
                                                        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                                                        -webkit-tap-highlight-color: transparent; white-space: nowrap; 
                                                        transition: background-color 0.2s ease;" 
                                                 target="_blank" 
                                                 onmouseover="this.style.backgroundColor='#333'" 
                                                 onmouseout="this.style.backgroundColor='#000'">\${buttonText}</a>
                                          </div>
                                      </div>
                                      
                                      <!-- Description -->
                                      <p class="ad-description" style="margin: 0; color: #555; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.5;">\${data.description}</p>
                                  </div>
                              </div>
                          </div>
                      \`;
                      
                      // Clean up
                      document.body.removeChild(script);
                      delete window[callbackName];
                  };
                  
                  script.src = apiUrl + '?callback=' + callbackName;
                  document.body.appendChild(script);
                  
                  // Set a timeout to handle failed requests
                  setTimeout(function() {
                      if (window[callbackName]) {
                          // Clear the widget content completely on timeout
                          adWidget.innerHTML = '';
                          document.body.removeChild(script);
                          delete window[callbackName];
                      }
                  }, 10000); // 10 second timeout
              }
              
              // Only fetch ad if it's not closed for this session
              if (!isAdClosedForSession()) {
                  // Fetch ad when script loads
                  fetchAd();
                  
                  // Set up refresh timer only if ad is not closed
                  const refreshInterval = setInterval(function() {
                      // Check again before refreshing
                      if (isAdClosedForSession()) {
                          clearInterval(refreshInterval); // Stop refreshing if ad is closed
                      } else {
                          fetchAd();
                      }
                  }, 3600000); // Refresh every hour if not closed
              }
          })();
          `}
        </Script>
      </body>
    </html>
  )
}
