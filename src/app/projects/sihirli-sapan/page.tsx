export default function SihirliSapanReadmePage() {
  return (
    <div className="w-full h-full overflow-y-auto">
      <div className="markdown-body" style={{ padding: "24px" }}>
        <h1>Sihirli Sapan 🎯🖐️</h1>
        
        <p>
          Sihirli Sapan, Google'ın <strong>MediaPipe</strong> teknolojisini kullanarak yapay zeka destekli el takibi ile oynanabilen, <strong>Matter.js</strong> fizik motoruyla güçlendirilmiş, web tabanlı bir <em>Angry Birds</em> klonudur. Mouse veya klavyeye dokunmadan, sadece web kameranız karşısında el hareketleri yaparak kuşu sapanla fırlatıp hedefleri vurabilirsiniz!
        </p>

        <p>
          <strong>🔗 Canlı Demo:</strong> <a href="https://osmanbugrabolat.github.io/sihirli-sapan/" target="_blank" rel="noreferrer">Oyunu Buradan Oynayın</a>
        </p>

        <img src="https://raw.githubusercontent.com/osmanbugrabolat/sihirli-sapan/main/game.png" alt="Sihirli Sapan Oyun İçi Görsel" style={{ maxWidth: "100%", borderRadius: "8px", margin: "16px 0" }} />

        <h2>🌟 Özellikler</h2>
        <ul>
          <li><strong>👋 Yapay Zeka Destekli El Takibi:</strong> Elinizi yumruk yaparak kuşu kavrayın, geri çekin ve elinizi açarak fırlatın! (MediaPipe Hand Tracking)</li>
          <li><strong>🧱 Gelişmiş Fizik Motoru:</strong> Matter.js kullanılarak gerçekçi yerçekimi, çarpışma ve yıkım fizikleri.</li>
          <li><strong>🔊 Dinamik Ses Efektleri:</strong> Hiçbir harici ses dosyası kullanılmadan, tamamen <em>Web Audio API</em> ile kod üzerinden üretilen organik ses efektleri (gerilme, fırlatma, çarpışma).</li>
          <li><strong>🏆 5 Farklı Bölüm:</strong> Her biri kendine has tasarıma (ikiz kuleler, taş kale vb.) ve hedef puana sahip 5 zorlu seviye.</li>
          <li><strong>🎨 Modern Arayüz:</strong> Kullanıcı dostu ahşap paneller, şık butonlar ve akıcı animasyonlar (Vanilla CSS).</li>
        </ul>

        <h2>🎮 Nasıl Oynanır?</h2>
        <ol>
          <li>Oyuna girdiğinizde <strong>web kamerası izni</strong> vermeniz gerekmektedir.</li>
          <li>Ekranda elinizin iskeletini (mavi noktalar) gördüğünüzde sistem hazır demektir.</li>
          <li>Elinizi sapanın üzerine getirip <strong>yumruk (kapalı el)</strong> yapın. Bu, kuşu kavramanızı sağlar.</li>
          <li>Yumruğunuzu bozmadan elinizi geri ve aşağı doğru çekerek sapanı gerin.</li>
          <li>Hedefi belirledikten sonra parmaklarınızı açarak kuşu fırlatın!</li>
          <li>Blokları devirip domuzcukları patlatarak hedef puana ulaşmaya çalışın.</li>
        </ol>

        <h2>🛠️ Kurulum (Geliştiriciler İçin)</h2>
        <p>Proje tamamen <strong>Vanilla JavaScript, HTML ve CSS</strong> ile yazıldığı için herhangi bir derleme aşamasına (build step) veya sunucu tarafı bir teknolojiye ihtiyaç duymaz.</p>
        <ol>
          <li>Repoyu bilgisayarınıza klonlayın:
            <pre><code>git clone https://github.com/osmanbugrabolat/sihirli-sapan.git</code></pre>
          </li>
          <li>Proje dizinine gidin:
            <pre><code>cd sihirli-sapan</code></pre>
          </li>
          <li>Dosyaları yerel bir sunucuda çalıştırın (Örn. <code>npx serve</code> veya VS Code <em>Live Server</em> eklentisi):
            <pre><code>npx serve .</code></pre>
          </li>
          <li>Tarayıcınızda <code>http://localhost:3000</code> (veya sunucunuzun portu) adresine giderek oynamaya başlayın.</li>
        </ol>

        <h2>🎨 Varlıklar (Assets) ve Teşekkürler</h2>
        <ul>
          <li><strong>Ahşap, Cam ve Taş Bloklar:</strong> <a href="https://kenney.nl/assets/physics-assets" target="_blank" rel="noreferrer">Kenney.nl - Physics Assets</a> üzerinden alınmıştır (Ücretsiz ve Açık Kaynak).</li>
          <li><strong>Sapan, Arkaplan ve Karakterler:</strong> Projeye özgü olarak SVG ve PNG formatında özel üretilmiştir.</li>
          <li><strong>İkonlar:</strong> <a href="https://fontawesome.com/" target="_blank" rel="noreferrer">FontAwesome</a> ikon kütüphanesinden faydalanılmıştır.</li>
          <li><strong>Fizik Motoru:</strong> <a href="https://brm.io/matter-js/" target="_blank" rel="noreferrer">Matter.js</a></li>
          <li><strong>El Takibi (AI):</strong> <a href="https://developers.google.com/mediapipe" target="_blank" rel="noreferrer">Google MediaPipe Tasks Vision</a></li>
        </ul>

        <hr />
        
        <p><strong>Geliştirici:</strong> <a href="https://osmanbugrabolat.com.tr" target="_blank" rel="noreferrer">Osman Buğra Bolat</a></p>
      </div>
    </div>
  );
}
