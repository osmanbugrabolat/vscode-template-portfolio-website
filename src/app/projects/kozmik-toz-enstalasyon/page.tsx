export default function KozmikTozReadmePage() {
  return (
    <div className="w-full h-full overflow-y-auto">
      <div className="markdown-body" style={{ padding: "24px" }}>
        <h1>Kozmik Toz Enstalasyonu</h1>
        
        <p>
          Bu proje, <strong>MediaPipe</strong> kullanılarak geliştirilmiş interaktif, yapay zeka destekli bir görsel ve işitsel sanat deneyimidir. Web kamerası aracılığıyla kullanıcıların el hareketlerini algılar ve bu hareketlere göre ekranda dinamik "kozmik tozlar" ile eş zamanlı sesler/müzikler üretir.
        </p>

        <p>
          <a href="https://osmanbugrabolat.github.io/kozmik-toz-enstalasyon/" target="_blank" rel="noreferrer">🔗 Projeyi Deneyimle (Canlı Demo)</a>
        </p>

        <h2>🚀 Özellikler</h2>
        <ul>
          <li><strong>Gerçek Zamanlı El Takibi:</strong> MediaPipe Hand Landmarker teknolojisi ile ellerin yüksek hassasiyetle izlenmesi.</li>
          <li><strong>İnteraktif Hareketler (Gestures):</strong>
            <ul>
              <li><strong>Pinch (Çimdikleme):</strong> Partiküllerin çekim kuvvetini ve yönünü kontrol eder.</li>
              <li><strong>Fist (Yumruk):</strong> Partikül etkileşimlerini ve ses efektlerini değiştirir.</li>
              <li><strong>Clap (El Çırpma):</strong> İki elin birbirine yaklaşmasıyla görsel patlamalar (burst) ve özel ses efektleri tetiklenir.</li>
            </ul>
          </li>
          <li><strong>İki Farklı Evren (Realm):</strong> 
            <ul>
              <li><em>Lydian Evreni:</em> Mavi, mor ve turkuaz gibi soğuk uzay tonlarına sahip varsayılan evren.</li>
              <li><em>Phrygian Evreni:</em> Kırmızı, turuncu ve altın sarısı gibi sıcak tonlara sahip paralel evren.</li>
              <li><em>Evren Değiştirme:</em> Her iki el de ekranın en üst kısımlarına (ilk %15'lik alana) kaldırıldığında iki evren arasında geçiş yapılır.</li>
            </ul>
          </li>
          <li><strong>Derinlik Algısı (Z-Axis):</strong> Elin ekrandaki büyüklüğü baz alınarak kameraya olan uzaklığı hesaplanır. Bu, 3 boyutlu bir his yaratarak sistemin tepkilerini zenginleştirir.</li>
          <li><strong>Bağımsız Motorlar:</strong>
            <ul>
              <li><code>art_engine.js</code>: Ekranda gördüğümüz görsel şöleni ve partikül fiziğini hesaplar.</li>
              <li><code>audio_engine.js</code>: El hareketlerine ve evren durumuna bağlı olarak dinamik ses sentezler.</li>
            </ul>
          </li>
        </ul>

        <h2>🛠️ GitHub'dan İndirme ve Kurulum</h2>
        <p>Projede bir yapay zeka modeli (<code>hand_landmarker.task</code>) ve çeşitli modüler JavaScript dosyaları bulunduğu için, tarayıcıların güvenlik (CORS) kuralları gereği bu dosyaları yerel bir sunucu (Local Web Server) üzerinden çalıştırmalısınız.</p>
        
        <p>İşte adım adım kurulum rehberi:</p>

        <h3>Yöntem 1: Git Kullanarak (Önerilen)</h3>
        <ol>
          <li><strong>Repoyu Klonlayın:</strong> Terminal veya komut satırınızı açıp aşağıdaki komutu çalıştırarak projeyi bilgisayarınıza indirin:
            <pre><code>git clone https://github.com/osmanbugrabolat/kozmik-toz-enstalasyon.git</code></pre>
          </li>
          <li><strong>Proje Klasörüne Girin:</strong>
            <pre><code>cd kozmik-toz-enstalasyon</code></pre>
          </li>
        </ol>

        <h3>Yöntem 2: ZIP Olarak İndirme</h3>
        <ol>
          <li>Bu Github sayfasının sağ üst köşesindeki yeşil renkli <strong>"Code"</strong> butonuna tıklayın.</li>
          <li>Açılan menüden <strong>"Download ZIP"</strong> seçeneğini seçerek dosyaları bilgisayarınıza indirin.</li>
          <li>İnen ZIP dosyasını klasöre çıkartın (Extract).</li>
          <li>Çıkardığınız klasörü VS Code veya tercih ettiğiniz başka bir kod editörü ile açın.</li>
        </ol>

        <h3>Projeyi Çalıştırma</h3>
        <p>Projeyi tarayıcıda açmak için yerel sunucu başlatmanız gerekir. Bunun için iki kolay yol vardır:</p>
        <ul>
          <li><strong>Seçenek A (Node.js Yüklü İse):</strong> Terminalinizde proje klasöründeyken şu komutu çalıştırın:
            <pre><code>npx serve .</code></pre>
          </li>
          <li><strong>Seçenek B (VS Code Kullanıyorsanız):</strong> VS Code içerisinden eklentiler (Extensions) bölümüne gidip <strong>"Live Server"</strong> eklentisini kurun. Kurulum bittikten sonra <code>index.html</code> dosyasına sağ tıklayıp <strong>"Open with Live Server"</strong> seçeneğini seçin.</li>
        </ul>
        <p>Tarayıcınız otomatik açılacak ve projeniz (genellikle <code>http://localhost:3000</code> veya <code>http://127.0.0.1:5500</code> adresinde) çalışmaya başlayacaktır.<br/>
        Tarayıcının talep edeceği <strong>Kamera İznini</strong> onaylayın, sesi başlatmak için <strong>ekrana bir kez tıklayın</strong> ve ellerinizi kameraya göstererek evreni kontrol etmeye başlayın!</p>

        <h2>📁 Dosya Yapısı</h2>
        <ul>
          <li><code>index.html</code>: Projenin ana yapısı, video ve canvas bileşenleri.</li>
          <li><code>style.css</code>: Arayüz tasarımı, tam ekran yerleşimleri.</li>
          <li><code>script.js</code>: MediaPipe el algılama motorunun yüklenmesi, jest algılama (yumruk, çırpma vb.) ve ana kontrol döngüsü.</li>
          <li><code>art_engine.js</code>: Canvas tabanlı interaktif çizim ve görsel simülasyon motoru.</li>
          <li><code>audio_engine.js</code>: El hareketlerine ve derinliğe duyarlı çalışan dinamik ses motoru.</li>
          <li><code>hand_landmarker.task</code>: MediaPipe tarafından kullanılan el takibi yapay zeka model dosyası.</li>
        </ul>

        <h2>💻 Kullanılan Teknolojiler</h2>
        <ul>
          <li><strong>HTML5 Canvas API</strong> (Görselleştirme için)</li>
          <li><strong>Web Audio API</strong> (Ses sentezleme için)</li>
          <li><strong>MediaPipe Tasks Vision</strong> (Yapay Zeka / El Takibi için)</li>
          <li><strong>Vanilla ES6+ JavaScript</strong></li>
        </ul>
      </div>
    </div>
  );
}
