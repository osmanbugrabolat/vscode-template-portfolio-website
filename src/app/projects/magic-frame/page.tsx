export default function MagicFrameReadmePage() {
  return (
    <div className="w-full h-full overflow-y-auto">
      <div className="markdown-body" style={{ padding: "24px" }}>
        <h1>✨ Magic Frame AR</h1>
        
        <p>
          <strong>Magic Frame</strong>, bilgisayar kamerasını kullanarak ellerinizle oluşturduğunuz çerçeve alanına gerçek zamanlı <strong>Yapay Zeka</strong> ve <strong>Artırılmış Gerçeklik (AR)</strong> filtreleri uygulayan yenilikçi bir görüntü işleme projesidir.
        </p>

        <p>
          Ellerinizin arasındaki boşluğu sihirli bir portala dönüştürün!
        </p>

        <h2>🚀 Özellikler</h2>
        <ul>
          <li><strong>🖐️ Gerçek Zamanlı El Takibi:</strong> Google MediaPipe altyapısı ile parmak uçlarınızı 3 boyutlu ve gecikmesiz olarak takip eder.</li>
          <li><strong>🖼️ 15 Farklı Sanat & Görüntü Filtresi:</strong> Sinirsel Stil Transferi ve görüntü işleme algoritmaları ile çerçevenin içini anında bambaşka bir dünyaya dönüştürür.</li>
          <li><strong>🪞 Sihirli Ayna:</strong> Sizi arka plandan ayırarak etrafınızı profesyonel kameralardaki gibi yoğun şekilde bulanıklaştırır.</li>
          <li><strong>🚥 Cyberpunk Neon Çerçeve:</strong> Seçtiğiniz tarza göre rengi değişen, fütüristik görünümlü parlayan bir "HUD" çerçevesi çizer.</li>
          <li><strong>✋ Hareket Algılama:</strong> Efektleri değiştirmek için klavyeye dokunmanıza gerek yok. İki elinizle <strong>çimdik atarak</strong> filtreler arasında sihirli bir şekilde geçiş yapabilirsiniz.</li>
        </ul>

        <h2>🎨 Mevcut Tarzlar (15 Filtre)</h2>
        <p>Sistem aşağıdaki 15 farklı efekti destekler:</p>
        <ol>
          <li>🍬 <strong>Şeker (Candy)</strong> - <em>Yapay Zeka</em></li>
          <li>🎨 <strong>Yağlı Boya (Mosaic)</strong> - <em>Yapay Zeka</em></li>
          <li>🎭 <strong>Sanatsal (Udnie)</strong> - <em>Yapay Zeka</em></li>
          <li>🌧️ <strong>Yağmur Prensesi</strong> - <em>Yapay Zeka</em></li>
          <li>🖌️ <strong>Noktalıcılık (Pointilism)</strong> - <em>Yapay Zeka</em></li>
          <li>🪞 <strong>Sihirli Ayna</strong> (Arka Plan Bulanıklaştırma) - <em>MediaPipe</em></li>
          <li>⬛ <strong>Siyah Beyaz</strong></li>
          <li>👾 <strong>Oyun Karakteri (Cartoon)</strong></li>
          <li>✏️ <strong>Kara Kalem (Siyah Beyaz)</strong></li>
          <li>🖍️ <strong>Kara Kalem (Renkli)</strong></li>
          <li>💧 <strong>Sulu Boya</strong></li>
          <li>🎞️ <strong>Sepya (Eski Fotoğraf)</strong></li>
          <li>🩻 <strong>Negatif (X-Ray)</strong></li>
          <li>🟩 <strong>Minecraft Piksel</strong></li>
          <li>🔴 <strong>Termal Kamera (Isı Haritası)</strong></li>
        </ol>

        <h2>🛠️ Kurulum</h2>
        <p>Proje Python tabanlıdır ve çalışması için bir kaç kütüphaneye ve yapay zeka model dosyasına ihtiyaç duyar.</p>
        
        <p><strong>1. Gerekli kütüphaneleri yükleyin:</strong></p>
        <pre><code>pip install -r requirements.txt</code></pre>

        <p><strong>2. Yapay Zeka modellerini indirin:</strong><br/>
        <em>(Bu betik gerekli olan ONNX sanat modellerini ve MediaPipe yapay zeka modellerini tek tuşla otomatik indirecektir).</em></p>
        <pre><code>python download_models.py</code></pre>

        <h2>🎮 Kullanım</h2>
        <p>Tüm kurulumları tamamladıktan sonra kameranızı açıp sihire başlamak için:</p>
        <pre><code>python main.py</code></pre>

        <h3>Kontroller</h3>
        <ul>
          <li><strong>Filtre Değiştirmek İçin:</strong> Her iki elinizle kameraya çerçeve yaparken, işaret parmağınızı başparmağınıza değdirip bırakın (Çimdik hareketi).</li>
          <li><strong>Çıkış Yapmak İçin:</strong> Seçili olan pencere üzerindeyken klavyeden <code>q</code> tuşuna basın.</li>
        </ul>

        <h2>📝 Kullanılan Teknolojiler</h2>
        <ul>
          <li><a href="https://opencv.org/" target="_blank" rel="noreferrer">OpenCV (DNN)</a> - Görüntü işleme ve yapay zeka modellerini çalıştırma</li>
          <li><a href="https://developers.google.com/mediapipe" target="_blank" rel="noreferrer">Google MediaPipe Tasks API</a> - El ve insan tespiti (Hand Landmarker & Image Segmenter)</li>
          <li><a href="https://github.com/onnx/models" target="_blank" rel="noreferrer">ONNX Model Zoo</a> - Önceden eğitilmiş sanat modelleri</li>
        </ul>

        <hr />
        <p><em>Bu proje açık kaynaklı AI modelleri kullanılarak tasarlanmıştır.</em><br/>
        <strong>Geliştirici:</strong> <a href="https://osmanbugrabolat.com.tr" target="_blank" rel="noreferrer">Osman Buğra Bolat</a></p>
      </div>
    </div>
  );
}
