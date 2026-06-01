document.getElementById('materiForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const mataPelajaran = document.getElementById('mataPelajaran').value;
    const jenjangPendidikan = document.getElementById('jenjangPendidikan').value;
    const totalPertemuan = parseInt(document.getElementById('totalPertemuan').value);
    const jamPerPertemuan = parseFloat(document.getElementById('jamPerPertemuan').value);
    
    // Validasi
    if (!mataPelajaran || !jenjangPendidikan || !totalPertemuan || !jamPerPertemuan) {
        showNotification('Mohon isi semua field!', 'error');
        return;
    }
    
    // Tampilkan loading
    document.getElementById('loading').style.display = 'flex';
    document.getElementById('hasilMateri').style.display = 'none';
    document.getElementById('generateBtn').disabled = true;
    
    // Animasi progress bar
    animateProgressBar();
    
    try {
        const response = await fetch('/api/generate-materi', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                mataPelajaran,
                jenjangPendidikan,
                totalPertemuan,
                jamPerPertemuan
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            tampilkanMateri(result.data);
            showNotification('Materi berhasil dibuat!', 'success');
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        showNotification('Error: ' + error.message, 'error');
        console.error(error);
    } finally {
        setTimeout(() => {
            document.getElementById('loading').style.display = 'none';
            document.getElementById('generateBtn').disabled = false;
        }, 1000);
    }
});

function animateProgressBar() {
    const progressBar = document.querySelector('.progress-bar-loading');
    if (progressBar) {
        progressBar.style.width = '0%';
        setTimeout(() => {
            progressBar.style.width = '70%';
        }, 100);
        setTimeout(() => {
            progressBar.style.width = '100%';
        }, 2000);
    }
}

function tampilkanMateri(materi) {
    const container = document.getElementById('hasilMateri');
    const resultsContainer = container.querySelector('.results-container');
    
    let html = `
        <div class="materi-card">
            <div class="materi-header">
                <h2>
                    <i class="fas fa-graduation-cap"></i> 
                    ${materi.judul_materi || 'Materi Pembelajaran'}
                </h2>
                <p class="mb-0">
                    <i class="fas fa-info-circle"></i> 
                    ${materi.deskripsi_umum || 'Deskripsi materi akan muncul di sini'}
                </p>
            </div>
            <div class="materi-body">
    `;
    
    // Tampilkan setiap pertemuan
    if (materi.rincian_pertemuan && Array.isArray(materi.rincian_pertemuan)) {
        materi.rincian_pertemuan.forEach(pertemuan => {
            html += `
                <div class="pertemuan-card">
                    <div class="pertemuan-title">
                        <i class="fas fa-calendar-alt"></i> 
                        Pertemuan ${pertemuan.pertemuan_ke}
                        <span class="badge-durasi">
                            <i class="fas fa-clock"></i> ${pertemuan.durasi || '2 Jam'}
                        </span>
                    </div>
                    
                    <h5 class="mt-3">
                        <i class="fas fa-tag"></i> Topik: 
                        <span class="text-primary">${pertemuan.topik || 'Topik pertemuan'}</span>
                    </h5>
                    
                    <div class="mt-4">
                        <h6><i class="fas fa-bullseye text-success"></i> Tujuan Pembelajaran:</h6>
                        <ul>
                            ${pertemuan.tujuan_pembelajaran && Array.isArray(pertemuan.tujuan_pembelajaran) 
                                ? pertemuan.tujuan_pembelajaran.map(tujuan => `<li>${tujuan}</li>`).join('')
                                : '<li>Tujuan pembelajaran akan ditampilkan di sini</li>'
                            }
                        </ul>
                    </div>
                    
                    <div class="mt-4">
                        <h6><i class="fas fa-list text-info"></i> Sub Materi:</h6>
                        <ul>
                            ${pertemuan.sub_materi && Array.isArray(pertemuan.sub_materi)
                                ? pertemuan.sub_materi.map(sub => `<li>${sub}</li>`).join('')
                                : '<li>Sub materi akan ditampilkan di sini</li>'
                            }
                        </ul>
                    </div>
                    
                    <div class="mt-4">
                        <h6><i class="fas fa-align-left text-warning"></i> Materi Lengkap:</h6>
                        <div class="bg-white p-3 rounded" style="line-height: 1.8;">
                            ${pertemuan.materi_lengkap ? pertemuan.materi_lengkap.replace(/\n/g, '<br>') : 'Materi akan ditampilkan di sini'}
                        </div>
                    </div>
                    
                    <div class="mt-4">
                        <h6><i class="fas fa-question-circle text-danger"></i> Soal Latihan:</h6>
                        ${pertemuan.soal_latihan && Array.isArray(pertemuan.soal_latihan)
                            ? pertemuan.soal_latihan.map((soal, idx) => `
                                <div class="soal-card">
                                    <strong>Soal ${idx + 1}:</strong> ${soal.soal || 'Pertanyaan soal'}<br>
                                    <strong class="text-success">Jawaban:</strong> ${soal.jawaban || 'Jawaban soal'}<br>
                                    <strong class="text-info">Pembahasan:</strong> ${soal.penjelasan || 'Penjelasan jawaban'}
                                </div>
                            `).join('')
                            : '<p>Soal latihan akan ditampilkan di sini</p>'
                        }
                    </div>
                    
                    ${pertemuan.studi_kasus ? `
                        <div class="studi-kasus-card mt-4">
                            <h6><i class="fas fa-chart-line"></i> Studi Kasus:</h6>
                            <p><strong>Kasus:</strong> ${pertemuan.studi_kasus.kasus || 'Deskripsi studi kasus'}</p>
                            <p><strong>Pertanyaan:</strong> ${pertemuan.studi_kasus.pertanyaan || 'Pertanyaan studi kasus'}</p>
                            <p><strong>Pembahasan:</strong> ${pertemuan.studi_kasus.pembahasan || 'Pembahasan studi kasus'}</p>
                        </div>
                    ` : ''}
                </div>
            `;
        });
    }
    
    html += `
                ${materi.kesimpulan ? `
                    <div class="alert alert-success mt-4">
                        <h5><i class="fas fa-graduation-cap"></i> Kesimpulan:</h5>
                        <p>${materi.kesimpulan}</p>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
    
    resultsContainer.innerHTML = html;
    container.style.display = 'block';
    
    // Tambahkan tombol copy
    addCopyButton();
    
    // Scroll ke hasil
    setTimeout(() => {
        container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}

function addCopyButton() {
    // Hapus tombol copy yang lama jika ada
    const oldButton = document.querySelector('.btn-copy-materi');
    if (oldButton) oldButton.remove();
    
    // Buat tombol copy baru
    const copyButton = document.createElement('button');
    copyButton.className = 'btn-copy-materi';
    copyButton.innerHTML = '<i class="fas fa-copy"></i> Copy Semua Materi';
    copyButton.onclick = copyAllMateri;
    document.body.appendChild(copyButton);
}

function copyAllMateri() {
    const materiContent = document.querySelector('.results-container').innerText;
    navigator.clipboard.writeText(materiContent).then(() => {
        showNotification('Materi berhasil disalin ke clipboard!', 'success');
        
        // Animasi tombol
        const btn = document.querySelector('.btn-copy-materi');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check"></i> Tersalin!';
        setTimeout(() => {
            btn.innerHTML = originalText;
        }, 2000);
    }).catch(() => {
        showNotification('Gagal menyalin materi', 'error');
    });
}

function showNotification(message, type = 'success') {
    // Buat elemen notifikasi
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Style notifikasi
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10B981' : '#EF4444'};
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        font-weight: 500;
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        box-shadow: 0 10px 20px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        gap: 12px;
    `;
    
    document.body.appendChild(notification);
    
    // Hapus notifikasi setelah 3 detik
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Tambahkan style animasi untuk notifikasi
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Smooth scroll untuk anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Animasi saat scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.querySelectorAll('.feature-card, .form-container').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'all 0.6s ease';
    observer.observe(el);
});