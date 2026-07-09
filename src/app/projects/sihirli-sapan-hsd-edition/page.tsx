export default function SihirliSapanHSDEditionReadmePage() {
  return (
    <div className="w-full h-full overflow-y-auto">
      <div className="markdown-body" style={{ padding: "24px" }}>
        <h1>Sihirli Sapan - HSD Edition 🎯🖐️</h1>
        
        <p>
          Sihirli Sapan, Google'ın <strong>MediaPipe</strong> teknolojisini kullanarak yapay zeka destekli el takibi ile oynanabilen, <strong>Matter.js</strong> fizik motoruyla güçlendirilmiş, web tabanlı bir <em>Angry Birds</em> klonudur. HSD Türkiye için özel olarak geliştirilen bu versiyonda, HSD maskotunu sapanla fırlatarak yazılım böceklerini (bug) ezmeye çalışıyorsunuz!
        </p>

        <p>
          <strong>🔗 Canlı Demo:</strong> <a href="https://osmanbugrabolat.github.io/sihirli-sapan-hsd-edition/" target="_blank" rel="noreferrer">Oyunu Buradan Oynayın</a>
        </p>

        <img src="https://raw.githubusercontent.com/osmanbugrabolat/sihirli-sapan-hsd-edition/main/game.png" alt="Sihirli Sapan HSD Edition Oyun İçi Görsel" style={{ maxWidth: "100%", borderRadius: "8px", margin: "16px 0" }} />

        <h2>🌟 Özellikler</h2>
        <ul>
          <li><strong>👋 Yapay Zeka Destekli El Takibi:</strong> Elinizi yumruk yaparak maskotu kavrayın, geri çekin ve parmaklarınızı açarak fırlatın! Sadece web kameranız yeterli.</li>
          <li><strong>🧱 Gelişmiş Fizik Motoru:</strong> Matter.js kullanılarak gerçekçi yerçekimi, çarpışma ve yıkım fizikleri. Ahşap, cam ve taş yapıları stratejik olarak yıkın.</li>
          <li><strong>🏆 Rekabetçi Lider Tablosu:</strong> Oyun içi skorunuzdan harcadığınız süreye (saniye başına 30 puan ceza) bağlı olarak düşülen puanla oluşturulan adil bir "Zaman Cezası" sistemi. Günlük, Haftalık ve Aylık listelerde zirveye yerleşin!</li>
          <li><strong>📈 10 Farklı Bölüm:</strong> Her seviyede giderek zorlaşan hedefler, rastgele (procedural) kule üretim sistemi.</li>
          <li><strong>🎨 HSD Özel Tasarımı:</strong> HSD Türkiye renk paleti (Sarı, Kırmızı, Lacivert, Pembe), hareketli maskot animasyonları, özel fontlar ve modern arayüz tasarımı.</li>
        </ul>

        <h2>🎮 Nasıl Oynanır?</h2>
        <ol>
          <li>Oyuna girdiğinizde tarayıcınızın <strong>kamera izni</strong> uyarısına onay verin.</li>
          <li>Ekranda elinizin iskeletini (mavi noktalar) gördüğünüzde sistem oyuna hazır demektir.</li>
          <li>Adınızı girip oyuna başlayın.</li>
          <li>Elinizi sapanın üzerine getirip <strong>YUMRUK (kapalı el)</strong> yapın.</li>
          <li>Yumruğunuzu bozmadan elinizi geri ve aşağı doğru çekerek sapanı gerin.</li>
          <li>Hedefi belirledikten sonra parmaklarınızı <strong>AÇARAK</strong> maskotu fırlatın!</li>
          <li>Yapıları devirip böcekleri (bug) ezerek yüksek skor ve kısa süre yapmaya çalışın.</li>
        </ol>

        <h2>🛠️ Kurulum (Geliştiriciler İçin)</h2>
        <p>Proje tamamen <strong>Vanilla JavaScript, HTML ve CSS</strong> ile geliştirilmiştir. Herhangi bir derleme (build) işlemine gerek yoktur.</p>
        <ol>
          <li>Repoyu bilgisayarınıza klonlayın:
            <pre><code>git clone https://github.com/osmanbugrabolat/sihirli-sapan-hsd-edition.git</code></pre>
          </li>
          <li>Proje dizinine gidin:
            <pre><code>cd sihirli-sapan-hsd-edition</code></pre>
          </li>
          <li>Tarayıcınızın güvenlik kuralları (CORS) gereği kameraya erişim için projeyi yerel bir sunucuda çalıştırmanız önerilir:
            <pre><code>npx serve .</code></pre>
          </li>
          <li>Tarayıcınızda <code>http://localhost:3000</code> adresine giderek oynamaya başlayın.</li>
        </ol>

        <h2>🎨 Varlıklar (Assets) ve Teknolojiler</h2>
        <ul>
          <li><strong>Fizik Motoru:</strong> <a href="https://brm.io/matter-js/" target="_blank" rel="noreferrer">Matter.js</a></li>
          <li><strong>El Takibi (AI):</strong> <a href="https://developers.google.com/mediapipe" target="_blank" rel="noreferrer">Google MediaPipe Tasks Vision</a></li>
          <li><strong>Arayüz:</strong> Saf (Vanilla) HTML/CSS. HSD kurumsal kimlik renkleri ve <em>Luckiest Guy</em> fontu kullanılmıştır.</li>
          <li><strong>Grafikler:</strong> Sapan, maskot ve böcek çizimleri projeye özel SVG formatında üretilmiştir. Kule blokları ise kod ile çizilmektedir.</li>
        </ul>

        <h2>📜 Lisans</h2>
        <p>Bu proje <strong>HSD Türkiye</strong> için geliştirilmiş olup açık kaynak olarak paylaşılmaktadır.<br/>
        <em>Developed by Osman Buğra Bolat for HSD Türkiye.</em></p>

        <hr />
        
        <p><strong>Geliştirici:</strong> <a href="https://osmanbugrabolat.com.tr" target="_blank" rel="noreferrer">Osman Buğra Bolat</a></p>
      </div>
    </div>
  );
}
