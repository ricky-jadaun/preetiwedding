export function copyToClipboard(text, buttonElement) {
    navigator.clipboard.writeText(text).then(() => {
        // Create or show toast
        let toast = document.getElementById('copy-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'copy-toast';
            toast.className = 'toast-copy';
            document.body.appendChild(toast);
        }
        
        toast.innerText = 'Copied to clipboard!';
        toast.classList.add('show');
        
        // Change button state
        const originalHTML = buttonElement.innerHTML;
        buttonElement.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
        buttonElement.style.backgroundColor = '#25D366';
        buttonElement.style.color = '#fff';
        buttonElement.style.borderColor = '#25D366';
        
        setTimeout(() => {
            toast.classList.remove('show');
            buttonElement.innerHTML = originalHTML;
            buttonElement.style = '';
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy: ', err);
    });
}
