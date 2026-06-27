export default function FlyingBirdsReadmePage() {
  return (
    <div className="w-full h-full overflow-y-auto">
      <div className="markdown-body" style={{ padding: "24px" }}>
        <h1>Flying Birds AI</h1>
        
        <p>
          <strong>Canlı Demo:</strong> <a href="https://osmanbugrabolat.github.io/flying-birds-with-mediapipe/" target="_blank" rel="noreferrer">Oyunu Buradan Oynayın</a>
        </p>

        <img src="https://raw.githubusercontent.com/osmanbugrabolat/flying-birds-with-mediapipe/main/game.png" alt="Flying Birds AI Oynanış Görüntüsü" style={{ maxWidth: "100%", borderRadius: "8px", margin: "16px 0" }} />

        <h2>Genel Bakış</h2>
        <p>Flying Birds AI, klasik engellerden kaçma oyunlarından ilham alan etkileşimli, tarayıcı tabanlı bir oyundur. Bu projeyi diğerlerinden ayıran en önemli özellik, Google'ın MediaPipe makine öğrenimi modeliyle entegre çalışmasıdır. Oyuncular bir klavye veya fare kullanmak yerine, web kameraları aracılığıyla gerçek zamanlı olarak algılanan el hareketleriyle kuşu tamamen temassız bir şekilde kontrol ederler.</p>
        <p>Proje, "glassmorphism" tasarım prensipleri, duyarlı tuval ölçeklendirmesi, kodla üretilmiş vektörel grafikler ve Web Audio API aracılığıyla sentezlenen dinamik ses efektleri ile modern bir kullanıcı arayüzü sunmaya odaklanılarak geliştirilmiştir.</p>

        <h2>Özellikler</h2>
        <ul>
          <li><strong>Bilgisayarlı Görü Kontrolleri:</strong> Kullanıcının işaret parmağını gerçek zamanlı olarak takip etmek için MediaPipe Hands modelini kullanır. Kuşun dikey konumu doğrudan kullanıcının el konumuna göre ayarlanır.</li>
          <li><strong>Responsive Tasarım:</strong> Oyun motoru, <code>ResizeObserver</code> kullanarak tuvali, çarpışma kutularını ve oyun içi öğeleri herhangi bir bozulma olmadan her ekran boyutuna veya en boy oranına mükemmel şekilde uyacak şekilde dinamik olarak ölçeklendirir.</li>
          <li><strong>Modern Kullanıcı Arayüzü:</strong> Şık bir glassmorphism tasarımı, açılır-kapanır ayar menüleri ve oyun alanını kapatmayan kamera önizleme ekranı içerir.</li>
          <li><strong>Yerel Sentezlenmiş Ses:</strong> Ses efektleri, harici ses dosyalarının indirilmesine gerek kalmadan ve gecikmesiz bir deneyim sağlamak için Web Audio API kullanılarak tarayıcıda doğrudan matematiksel olarak sentezlenir.</li>
          <li><strong>Bağımsız Vektörel Grafikler:</strong> Oyun varlıkları (örneğin kuş tasarımı), inline SVG kullanılarak matematiksel olarak oluşturulmuştur. Bu sayede yüksek çözünürlüklü ekranlarda bile sonsuz ölçeklenebilirlik ve keskin bir görüntü kalitesi sağlanır.</li>
        </ul>

        <h2>Kullanılan Teknolojiler</h2>
        <ul>
          <li><strong>HTML5 & CSS3:</strong> Belgenin yapılandırılması ve kullanıcı arayüzünün tasarlanması için.</li>
          <li><strong>JavaScript (ES6):</strong> Temel oyun mantığı, fizik hesaplamaları ve DOM manipülasyonu için.</li>
          <li><strong>HTML5 Canvas API:</strong> Oyun döngüsü, borular ve grafiklerin 60 FPS hızında çizdirilmesi için.</li>
          <li><strong>MediaPipe Hands:</strong> Tarayıcı tabanlı, gerçek zamanlı el takibi ve eklem noktası tespiti için.</li>
          <li><strong>Web Audio API:</strong> Retro tarzı oyun ses efektlerinin sentezlenmesi için.</li>
        </ul>

        <h2>Nasıl Oynanır?</h2>
        <ol>
          <li>Tarayıcınıza kameranıza erişim izni verin.</li>
          <li>Elinizi, sağ alt köşedeki önizleme penceresinde görünecek şekilde kameranın önüne yerleştirin.</li>
          <li>Kuşun dikey konumunu kontrol etmek için işaret parmağınızı yukarı ve aşağı doğru hareket ettirin.</li>
          <li>Puanınızı artırmak için size doğru yaklaşan boruların arasındaki boşluklardan geçin.</li>
          <li>Kuş borulara, tavana veya yere çarparsa oyun biter.</li>
        </ol>

        <h2>Ayarlar</h2>
        <p>Oyun, başlangıç ekranında oyuncuların deneyimlerini kişiselleştirebilmesi için açılır-kapanır yapıda bir ayarlar menüsü sunar:</p>
        <ul>
          <li><strong>Hangi El:</strong> Modelin kesinlikle Sağ El, Sol El veya herhangi bir eli takip etmesini seçin. Takip mantığı, web kamerasının yansımasını varsayılan olarak hesaba katar.</li>
          <li><strong>Oyun Hızı:</strong> Yaklaşan boruların hızını ve aralarındaki dikey boşluk miktarını ayarlayın (Yavaş, Normal, Hızlı).</li>
          <li><strong>Oyun Sesi:</strong> Web Audio API ile sentezlenen ses efektlerini açın veya kapatın.</li>
        </ul>

        <h2>Yerel Cihazda Çalıştırma</h2>
        <p>Proje kameraya erişim sağladığı ve dış kaynakları (CDN) yüklediği için, HTML dosyasının doğrudan dosya yöneticisinden açılması yerine yerel bir HTTP sunucusu üzerinden çalıştırılması gerekir.</p>
        <ol>
          <li>Depoyu yerel cihazınıza klonlayın:
            <pre><code>git clone https://github.com/osmanbugrabolat/flying-birds-with-mediapipe.git</code></pre>
          </li>
          <li>Terminalinizde proje dizinine gidin:
            <pre><code>cd flying-birds-with-mediapipe</code></pre>
          </li>
          <li>Yerel bir web sunucusu başlatın. Örneğin Python kullanarak:
            <pre><code>python3 -m http.server 8080</code></pre>
          </li>
          <li>Web tarayıcınızı açın ve <code>http://localhost:8080</code> adresine gidin.</li>
        </ol>

        <hr />
        
        <h2>Geliştirici</h2>
        <p><strong>Osman Buğra Bolat</strong> tarafından geliştirilmiştir.<br />
        Web Sitesi: <a href="https://osmanbugrabolat.com.tr" target="_blank" rel="noreferrer">osmanbugrabolat.com.tr</a></p>
      </div>
    </div>
  );
}
