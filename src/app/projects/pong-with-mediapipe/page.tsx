export default function PongReadmePage() {
  return (
    <div className="w-full h-full overflow-y-auto">
      <div className="markdown-body" style={{ padding: "24px" }}>
        <h1>Neon Pong AI: Hand-Tracking Web Game</h1>
        
        <p>
          <strong>Canlı Demo:</strong> <a href="https://osmanbugrabolat.github.io/pong-with-mediapipe/" target="_blank" rel="noreferrer">Buraya tıklayarak oyunu hemen tarayıcınızda oynayabilirsiniz!</a>
        </p>

        <p>
          <strong>Neon Pong AI</strong>, Google's Mediapipe el takibi teknolojisini kullanan, fütüristik neon tasarıma sahip modern bir web tabanlı Pong oyunudur. Oyunu klavye veya fare ile değil, doğrudan <strong>el hareketlerinizle</strong> web kamerası üzerinden oynarsınız!
        </p>

        <img src="https://raw.githubusercontent.com/osmanbugrabolat/pong-with-mediapipe/main/game.png" alt="Oyun İçi Görüntü" style={{ maxWidth: "100%", borderRadius: "8px", margin: "16px 0" }} />

        <h2>Özellikler</h2>
        <ul>
          <li><strong>Yapay Zeka Destekli El Takibi:</strong> Google Mediapipe sayesinde avuç içiniz anlık olarak tespit edilir ve raketiniz elinizle senkronize hareket eder.</li>
          <li><strong>Takım Seçimi & Akıllı Yönlendirme:</strong> Başlangıçta oynamak istediğiniz takımı (Sol/Sağ) seçebilirsiniz. Seçiminize göre kamera ayna etkisini hesaba katarak doğru elinizi algılar. AI rakip ise otomatik olarak karşı tarafa geçer.</li>
          <li><strong>Neon / Cyberpunk Tasarım:</strong> Tamamen Vanilla CSS ile tasarlanmış cam efektli, karanlık temalı ve yüksek kaliteli parlamalara sahip interaktif oyun menüsü.</li>
          <li><strong>Akıllı Rakip:</strong> Topu takip eden ancak insanımsı bir hata payı barındıran bir yapay zeka. Ralliler uzadıkça heyecan artar, top hızlanır!</li>
          <li><strong>Tam Kontrol:</strong> Oyun başlamadan önce menü üzerinden topun başlangıç hızını ayarlayabilirsiniz.</li>
        </ul>

        <h2>Kullanılan Teknolojiler</h2>
        <ul>
          <li><strong>HTML5 & CSS3:</strong> Modern, duyarlı ve şık arayüz tasarımı.</li>
          <li><strong>Vanilla JavaScript (ES6+):</strong> Oyun döngüsü, çarpışma fizikleri ve uygulama mantığı.</li>
          <li><strong>HTML5 Canvas:</strong> Kesintisiz oyun çizimi, animasyonlar ve neon parlama efektleri.</li>
          <li><strong><a href="https://developers.google.com/mediapipe" target="_blank" rel="noreferrer">Google Mediapipe</a>:</strong> Kamera üzerinden anlık görüntü işleme ve iskelet tabanlı el takibi (Hand Tracking modeli).</li>
        </ul>

        <h2>Nasıl Çalıştırılır?</h2>
        <p>Modern web tarayıcıları, güvenlik politikaları (CORS & Secure Context) gereği web kamerasına erişim için yerel bir sunucu bağlantısı gerektirir. Bu yüzden HTML dosyasına çift tıklamak yerine yerel sunucu kullanmalısınız.</p>
        
        <ol>
          <li>Bilgisayarınızda <a href="https://nodejs.org/" target="_blank" rel="noreferrer">Node.js</a>'in kurulu olduğundan emin olun.</li>
          <li>Projeyi bilgisayarınıza klonlayın:
            <pre><code>git clone https://github.com/osmanbugrabolat/pong-with-mediapipe.git</code></pre>
          </li>
          <li>Klonlanan klasörün içine girin:
            <pre><code>cd pong-with-mediapipe</code></pre>
          </li>
          <li>Yerel sunucuyu başlatmak için şu komutu çalıştırın:
            <pre><code>npx serve</code></pre>
          </li>
          <li>Terminalde size verilen adresi (genellikle <code>http://localhost:3000</code>) tarayıcınızda açın.</li>
          <li>Tarayıcınızın sağ üst veya sol üst kısmında belirecek olan <strong>Kamera İzni</strong>ni onaylayın.</li>
          <li>Hızınızı, takımınızı seçin ve <strong>OYUNA BAŞLA</strong>'ya tıklayın!</li>
        </ol>

        <h2>Oynanış İpuçları</h2>
        <ul>
          <li>Kameranın elinizi (özellikle avuç içinizi) net görebileceği ve ortam ışığının iyi olduğu bir mesafede durun.</li>
          <li>Seçtiğiniz takıma uygun olan elinizi kameraya doğru tutun (Örn: Sol takım için sol eliniz).</li>
          <li>Elinizi yukarı-aşağı hareket ettirerek raketi kontrol edin.</li>
        </ul>
        
        <hr />
        
        <p><strong>Geliştirici:</strong> <a href="https://osmanbugrabolat.com.tr" target="_blank" rel="noreferrer">Osman Buğra Bolat</a></p>
      </div>
    </div>
  );
}
