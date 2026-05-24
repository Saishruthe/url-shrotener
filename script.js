document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('shorten-form');
    const urlInput = document.getElementById('url-input');
    const submitBtn = document.getElementById('submit-btn');
    const resultContainer = document.getElementById('result-container');
    const shortUrlEl = document.getElementById('short-url');
    const copyBtn = document.getElementById('copy-btn');
    const errorContainer = document.getElementById('error-container');
    const errorMessage = document.getElementById('error-message');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const url = urlInput.value.trim();
        if (!url) return;

        // Reset UI
        errorContainer.classList.add('hidden');
        resultContainer.classList.add('hidden');
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.7';

        try {
            const response = await fetch('/api/shorten', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail?.[0]?.msg || data.detail || 'Failed to shorten URL');
            }

            shortUrlEl.href = data.short_url;
            shortUrlEl.textContent = data.short_url;
            resultContainer.classList.remove('hidden');
            
            // Reset copy button icon
            copyBtn.innerHTML = '<i data-feather="copy"></i>';
            copyBtn.classList.remove('success');
            feather.replace();

        } catch (error) {
            errorMessage.textContent = error.message;
            errorContainer.classList.remove('hidden');
        } finally {
            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';
        }
    });

    copyBtn.addEventListener('click', async () => {
        const urlToCopy = shortUrlEl.href;
        try {
            await navigator.clipboard.writeText(urlToCopy);
            copyBtn.innerHTML = '<i data-feather="check"></i>';
            copyBtn.classList.add('success');
            feather.replace();
            
            setTimeout(() => {
                copyBtn.innerHTML = '<i data-feather="copy"></i>';
                copyBtn.classList.remove('success');
                feather.replace();
            }, 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    });
});