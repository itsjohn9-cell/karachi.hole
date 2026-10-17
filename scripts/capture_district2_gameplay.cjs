const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const projectDir = '/Users/mohammadjhone/Projects/hole-io-android';
const indexPath = path.join(projectDir, 'dist/index.html');
const originalHtml = fs.readFileSync(indexPath, 'utf8');
const screenshotPath = '/Users/mohammadjhone/.gemini/antigravity-ide/brain/8f7fdb03-e8d7-4f64-a8d8-f34237ef865d/district2_live_gameplay_verified.png';

try {
  const injectedHtml = originalHtml.replace('</body>', `<script>
    window.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => {
        // 1. Remove onboarding modal
        const modal = document.getElementById('modal-start-mission');
        if (modal) {
          modal.style.display = 'none';
          modal.remove();
        }

        const startBtn = document.getElementById('btn-start-patrol');
        if (startBtn) startBtn.click();

        setTimeout(() => {
          const g = window.game;
          if (g) {
            // Force advance to district 2
            g.handleDistrictCleared();
            setTimeout(() => {
              const nextBtn = document.getElementById('btn-next-district');
              if (nextBtn) nextBtn.click();
              const dcModal = document.getElementById('modal-district-cleared');
              if (dcModal) {
                dcModal.style.display = 'none';
                dcModal.remove();
              }
            }, 300);
          }
        }, 500);
      }, 200);
    });
  </script></body>`);

  fs.writeFileSync(indexPath, injectedHtml);

  console.log('Capturing District 2 live 3D gameplay screenshot with Chrome...');
  const cmd = `"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --virtual-time-budget=6000 --screenshot="${screenshotPath}" --window-size=1280,800 "http://127.0.0.1:5173/"`;
  execSync(cmd, { stdio: 'inherit' });
  console.log('Screenshot captured successfully to:', screenshotPath);
} finally {
  fs.writeFileSync(indexPath, originalHtml);
}
