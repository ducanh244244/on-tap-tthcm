(function () {
  // =========================================================================
  // 1. PHÂN LOẠI CÂU HỎI CHO TỪNG MÔN (PHỦ KÍN 100% — 0 CÂU BỊ SÓT)
  // =========================================================================

  function classifyTTHCM(q) {
    const tags = [];
    const qLower = q.question.toLowerCase();
    const opts = Object.values(q.options || {}).filter(Boolean);
    const optsText = opts.join(" ").toLowerCase();
    const chap = (q.chapter || "").toUpperCase();

    // Bộ 1: Ngày tháng năm & Giai đoạn
    const isDateAnswer =
      opts.every((o) =>
        /^(trước năm|năm|thời kỳ|đêm ngày|ngày)?\s*(\d{1,2}\/\d{1,2}\/\d{4}|\d{1,2}\/\d{4}|\d{4}(\s*[-–]\s*\d{4})?)/i.test(
          o.trim()
        )
      ) ||
      /(vào thời gian nào|vào năm nào|năm bao nhiêu|vào ngày tháng năm nào|vào ngày bao nhiêu|vào thời điểm nào|từ khi nào|thuộc giai đoạn nào|là thời kỳ nào|là giai đoạn nào|xuất bản năm nào)/i.test(
        qLower
      );
    if (isDateAnswer) tags.push("date_time");

    // Bộ 2: Con số (Mấy / Bao nhiêu)
    const isNumberAnswer =
      opts.every((o) => /^(có\s*)?\d+(\s*phương pháp)?\.?$/i.test(o.trim())) ||
      /(mấy nội dung|mấy giai đoạn|mấy nguyên tắc|mấy chuẩn mực|mấy điều kiện|mấy phương pháp|mấy đặc trưng|mấy phương thức|bao nhiêu đạo luật|bao nhiêu nguyên tắc)/i.test(
        qLower
      );
    if (isNumberAnswer && !tags.includes("date_time")) tags.push("number_count");

    // Bộ 3: Đại hội, Văn kiện & Sự kiện
    const isCongressOrEvent =
      /(đại hội|văn kiện|cương lĩnh|hội nghị|mặt trận dân tộc|mặt trận nào|tổ chức nào|unesco|phong trào nào|tên gọi là gì|tuyên ngôn độc lập|quốc hội khóa)/i.test(
        qLower
      ) ||
      /(văn kiện đại hội|đại hội đại biểu|đại hội lần thứ|cương lĩnh xây dựng|mặt trận nhân dân|mặt trận tổ quốc|mặt trận độc lập|mặt trận việt minh|mặt trận dân chủ|bản yêu sách|đông du|hiến pháp năm)/i.test(
        optsText
      );
    if (isCongressOrEvent && !tags.includes("number_count")) tags.push("congress_event");

    // Bộ 4: Tác phẩm & Bài viết của Bác
    const isHcmWork =
      /(tác phẩm nào|bài viết nào|tác phẩm đầu tiên|văn bản nào)/i.test(qLower) ||
      /(đường cách mệnh|đường kách mệnh|sửa đổi lối làm việc|thường thức chính trị|đạo đức cách mạng|di chúc|bản án chế độ|lời kêu gọi toàn quốc|con đường dẫn tôi|hiến pháp năm 1946|người cán bộ cách mạng|đề cương văn hóa)/i.test(
        optsText
      );
    if (isHcmWork) tags.push("hcm_works");

    // Bộ 5: Cặp dễ nhầm & Giải nghĩa Luận điểm / Khái niệm
    const isCompareOrQuote =
      /(động lực của văn hóa|quan hệ giữa văn hóa|mối quan hệ giữa văn hóa|mục tiêu về .* của chủ nghĩa xã hội|đặc trưng .* của chủ nghĩa xã hội|giương cao ngọn cờ gì|tuyên bố nào|nhà nước của nhân dân|nhà nước vì dân|nền tảng của khối đại đoàn kết|dựa trên nền tảng nào)/i.test(
        qLower
      ) ||
      ((/[“"'].*[”"']/.test(q.question) ||
        /(có nghĩa là|nghĩa là gì|khẳng định điều gì|nói lên điều gì|đề cập đến điều gì|được hiểu như thế nào|ví như|nói lên nội dung gì)/i.test(
          qLower
        )) &&
        !tags.includes("date_time") &&
        !tags.includes("hcm_works") &&
        !tags.includes("congress_event"));
    if (isCompareOrQuote) tags.push("compare_quotes");

    // Bộ 6 & Bộ 7: Lý thuyết còn lại theo Chương 1-4 và Chương 5-6
    if (tags.length === 0) {
      if (chap.includes("5") || chap.includes("6")) {
        tags.push("ch5_6_theory");
      } else {
        tags.push("ch1_4_theory");
      }
    }

    return tags;
  }

  function classifyATTT(q) {
    const tags = [];
    const qLower = q.question.toLowerCase();
    const opts = Object.values(q.options || {}).filter(Boolean);
    const optsText = opts.join(" ").toLowerCase();
    const fullText = qLower + " " + optsText;

    // Bộ 1: Con số, Bit/Byte, Cổng (Port) & Bài tập tính toán
    const isCalcOrNumbers =
      opts.every((o) =>
        /^(\d+(\s*(bit|bits|byte|bytes|vòng|lần|ký tự|khóa|cổng|port|bước))?\.?|v\d+|version\s*\d+|2\^\d+|(\d+\s*,\s*)+\d+)$/i.test(
          o.trim()
        )
      ) ||
      /(\bmod\b|tính\s|kết quả\s|bản mã\s|bản rõ\s|dịch chuyển|khóa k\s*=|e\s*=|d\s*=|p\s*=|q\s*=|n\s*=|φ\(|phi\(|độ dài khóa|kích thước khối|bao nhiêu bit|mấy vòng|số vòng|cổng nào|port nào|sử dụng cổng|cổng mặc định|version của)/i.test(
        qLower
      );
    if (isCalcOrNumbers) tags.push("attt_numbers_calc");

    // Bộ 2: Mã hóa cổ điển & Thám mã
    const isClassical =
      /(caesar|affine|vigen|hill|playfair|rail fence|hoán vị|mã thay thế|mã hóa thay thế|mã cổ điển|mã hóa cổ điển|monoalphabetic|polyalphabetic|one-time pad|vernam|thám mã|tần suất)/i.test(
        fullText
      );
    if (isClassical) tags.push("attt_classical");

    // Bộ 3: Mã hóa hiện đại (DES, AES, RSA, Hàm băm, Chữ ký số, PKI)
    const isModernCrypto =
      /(\bdes\b|3des|\baes\b|\brsa\b|diffie|elgamal|\becc\b|rabin|merkle|khóa đối xứng|mã hóa đối xứng|khóa bất đối xứng|mã hóa bất đối xứng|khóa công khai|mã hóa công khai|khóa riêng|khóa bí mật|mã khối|mã dòng|\brc4\b|\becb\b|\bcbc\b|\bcfb\b|\bofb\b|\bctr\b|s-box|feistel|chữ ký số|ký số|hàm băm|\bhash\b|\bmd5\b|\bsha\b|\bhmac\b|\bpki\b|chứng chỉ số|chứng thực số|\bx\.509\b|\bca\b|thuật toán mã hóa|crack)/i.test(
        fullText
      );
    if (isModernCrypto) tags.push("attt_modern_crypto");

    // Bộ 4: Mã độc (Virus, Worm, Trojan, Ransomware, Spyware...)
    const isMalware =
      /(virus|worm|sâu máy tính|tấn công bằng sâu|trojan|ransomware|spyware|adware|rootkit|keylogger|botnet|backdoor|cửa sau|mã độc|logic bomb|bom logic|phần mềm độc hại)/i.test(
        fullText
      );
    if (isMalware) tags.push("attt_malware");

    // Bộ 5: Tấn công mạng, Xâm nhập & Lỗ hổng
    const isAttack =
      /(ddos|\bdos\b|từ chối dịch vụ|\bmitm\b|man-in-the-middle|sniffer|sniffing|nghe lén|spoofing|giả mạo|phishing|lừa đảo|sql injection|\bxss\b|\bcsrf\b|buffer overflow|tràn bộ đệm|brute force|từ điển|đoán mật khẩu|hijacking|syn flood|smurf|social engineering|kỹ nghệ xã hội|hacking|hacker|tấn công|quét lỗ hổng|quét cổng|nmap|nessus|kiểm tra các port|xác định vị trí)/i.test(
        qLower
      ) ||
      /(ddos|syn flood|smurf|sql injection|brute force|phishing|spoofing|hijacking|sniffing|buffer overflow|social engineering)/i.test(
        optsText
      );
    if (isAttack) tags.push("attt_attacks");

    // Bộ 6: Tường lửa, Luật lọc gói, ISA Server, IDS/IPS & Giao thức mạng
    const isFirewallNet =
      /(tường lửa|firewall|\bids\b|\bips\b|\bvpn\b|ipsec|\bssl\b|\btls\b|\bhttps\b|\bhttp\b|\bssh\b|\bftp\b|\bsmtp\b|\bsnmp\b|\bppp\b|\bdmz\b|honeypot|isa server|isa1|lọc gói|luật nào đúng|socket|quản trị mạng|giao thức|tcp|udp|cổng 25|cổng 80|port)/i.test(
        fullText
      );
    if (isFirewallNet) tags.push("attt_firewall_net");

    // Bộ 7: CIA, Xác thực, Phân quyền, Sao lưu & Chính sách ATTT (+ các câu còn lại)
    const isCiaPolicy =
      /(kerberos|xác thực|chứng thực|phân quyền|kiểm soát truy cập|\brbac\b|\bdac\b|\bmac\b|\bacl\b|sao lưu|backup|đĩa từ|mật khẩu|sinh trắc|\botp\b|\bmfa\b|\b2fa\b|\bcia\b|tính bảo mật|tính toàn vẹn|tính sẵn sàng|bí mật|rủi ro|chính sách|pháp luật|thông tin cá nhân|cơ sở dữ liệu|nhận dạng người dùng|an ninh mạng|an toàn thông tin)/i.test(
        qLower
      ) || tags.length === 0;
    if (isCiaPolicy) tags.push("attt_cia_policy");

    return tags;
  }

  // =========================================================================
  // 2. CẤU HÌNH TỪNG MÔN HỌC
  // =========================================================================

  const tthcmQuestions = (Array.isArray(window.QUESTIONS_DATA) ? window.QUESTIONS_DATA : []).map((q) => ({
    ...q,
    tags: classifyTTHCM(q),
  }));

  const atttQuestions = (Array.isArray(window.ATTT_DATA) ? window.ATTT_DATA : []).map((q) => ({
    ...q,
    tags: classifyATTT(q),
  }));

  const SUBJECTS = {
    tthcm: {
      id: "tthcm",
      title: "Tư Tưởng HCM",
      subtitle: `Hệ thống ôn luyện ${tthcmQuestions.length} câu`,
      icon: "★",
      iconClass: "",
      storageKey: "tthcm_quiz_state_v1",
      searchPlaceholder: "🔍 Tìm kiếm từ khóa (ví dụ: Véc-xây, 1930, đạo đức, Đại hội...)",
      questions: tthcmQuestions,
      categories: [
        {
          id: "all",
          icon: "📚",
          name: `Toàn bộ ${tthcmQuestions.length} câu hỏi`,
          desc: "Đầy đủ 220 câu gốc (phủ 100%)",
        },
        {
          id: "date_time",
          icon: "📅",
          name: "Bộ 1: Ngày tháng năm & Giai đoạn",
          desc: "Đáp án là mốc thời gian, năm, giai đoạn",
        },
        {
          id: "number_count",
          icon: "🔢",
          name: "Bộ 2: Con số (Mấy / Bao nhiêu)",
          desc: "Đáp án là số lượng 2, 3, 4, 5, 16...",
        },
        {
          id: "congress_event",
          icon: "🏛️",
          name: "Bộ 3: Đại hội, Văn kiện & Sự kiện",
          desc: "Đại hội VII–XIII, Cương lĩnh, Hội nghị, Tổ chức",
        },
        {
          id: "hcm_works",
          icon: "📖",
          name: "Bộ 4: Tác phẩm & Bài viết của Bác",
          desc: "Trích trong tác phẩm/bài viết nào",
        },
        {
          id: "compare_quotes",
          icon: "🧭",
          name: "Bộ 5: Cặp dễ nhầm & Giải nghĩa",
          desc: "Động lực VH, Mục tiêu CNXH, Câu nói",
        },
        {
          id: "ch1_4_theory",
          icon: "⚖️",
          name: "Bộ 6: Lý thuyết Đảng, Nhà nước & CM",
          desc: "Các câu trọng tâm Chương 1–4 còn lại",
        },
        {
          id: "ch5_6_theory",
          icon: "🤝",
          name: "Bộ 7: Lý thuyết Đoàn kết, Đạo đức, VH",
          desc: "Các câu trọng tâm Chương 5–6 còn lại",
        },
        {
          id: "wrong_only",
          icon: "❌",
          name: "Câu đang làm sai",
          desc: "Xem lại hoặc bấm Làm lại câu sai",
        },
        {
          id: "starred_only",
          icon: "⭐",
          name: "Câu đã đánh dấu sao",
          desc: "Các câu khó bạn bấm ngôi sao lưu lại",
        },
      ],
      chapters: [
        { id: "ALL", name: "Tất cả các chương" },
        { id: "CHƯƠNG 1 + 2", name: "Chương 1 + 2" },
        { id: "CHƯƠNG 3 + 4", name: "Chương 3 + 4" },
        { id: "CHƯƠNG 5", name: "Chương 5" },
        { id: "CHƯƠNG 6", name: "Chương 6" },
      ],
      tagLabels: {
        date_time: "📅 Bộ 1: Ngày tháng",
        number_count: "🔢 Bộ 2: Con số",
        congress_event: "🏛️ Bộ 3: Đại hội & Sự kiện",
        hcm_works: "📖 Bộ 4: Tác phẩm HCM",
        compare_quotes: "🧭 Bộ 5: Cặp dễ nhầm & Giải nghĩa",
        ch1_4_theory: "⚖️ Bộ 6: Đảng, NN & CM",
        ch5_6_theory: "🤝 Bộ 7: Đoàn kết, Đạo đức, VH",
      },
      cheatsheetGroups: [
        { tag: "date_time", title: "📅 Bộ 1: Mốc Thời Gian, Ngày Tháng Năm & Giai Đoạn" },
        { tag: "number_count", title: "🔢 Bộ 2: Các Con Số Dễ Nhầm (Mấy / Bao Nhiêu)" },
        { tag: "congress_event", title: "🏛️ Bộ 3: Sự Kiện, Đại Hội, Văn Kiện & Tổ Chức" },
        { tag: "hcm_works", title: "📖 Bộ 4: Tác Phẩm & Bài Viết Của Hồ Chí Minh" },
        { tag: "compare_quotes", title: "🧭 Bộ 5: Cặp Dễ Nhầm & Giải Nghĩa Luận Điểm" },
      ],
      trapNotesHtml: `
        <div class="cheat-card" style="border-color: rgba(251, 191, 36, 0.45);">
          <h3 style="color: #fbbf24;">⚠️ Lưu ý các cặp câu gần giống nhau trong bộ 220 câu TTHCM</h3>
          <table class="cheat-table">
            <thead>
              <tr>
                <th style="width:32%">Cặp câu hỏi</th>
                <th>Điểm khác biệt / Cách nhớ</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><b>Câu #16 (Chương 6)</b> vs <b>Câu #85 (Chương 5)</b></td>
                <td>• "Xây dựng con người cần chú ý <b>mấy nội dung</b>?" (Chương 6) → <span class="cheat-highlight">4</span><br>• "Xây dựng con người cần chú ý <b>trên mấy nội dung</b>?" (Chương 5) → <span class="cheat-highlight">3</span></td>
              </tr>
              <tr>
                <td><b>Câu #202 (Chương 5)</b> vs <b>Câu #220 (Chương 3+4)</b></td>
                <td>Cùng hỏi <i>"Trong giai đoạn hiện nay, để xây dựng được khối đại đoàn kết dân tộc vững chắc, cần dựa trên nền tảng nào"</i>:<br>• Câu có dấu hỏi <code>?</code> (Chương 5) → <span class="cheat-highlight">Giai cấp công nhân</span><br>• Câu không có dấu hỏi (Chương 3+4) → <span class="cheat-highlight">Liên minh công - nông - trí thức</span></td>
              </tr>
              <tr>
                <td><b>5 câu Động lực Văn hóa</b></td>
                <td>• Văn hóa <b>văn nghệ</b> → Nâng cao lòng yêu nước, lý tưởng...<br>• Văn hóa <b>chính trị</b> → Soi đường cho quốc dân đi...<br>• Văn hóa <b>pháp luật</b> → Bảo dân chủ, trật tự, kỷ cương, phép nước.<br>• Văn hóa <b>đạo đức</b> → Nâng cao phẩm giá, chân thiện mỹ.<br>• Văn hóa <b>giáo dục</b> → Diệt giặc dốt, xóa mù chữ, trồng người.</td>
              </tr>
              <tr>
                <td><b>Các kỳ Đại hội Đảng</b></td>
                <td>• <b>Đại hội VII (1991)</b>: Lần đầu nêu TTHCM + "Đảng lấy CN Mác-Lênin & TTHCM làm nền tảng..." + kết quả vận dụng sáng tạo.<br>• <b>Đại hội IX (2001)</b>: Định nghĩa đầu tiên (chưa có cụm <i>"vô cùng to lớn và quý giá... mãi mãi soi đường"</i>).<br>• <b>Đại hội XI (2011)</b>: Khái niệm hoàn chỉnh nhất đến nay + Cương lĩnh 2011 (<i>"Con người là trung tâm..."</i>).<br>• <b>Đại hội XII</b>: <i>"Đại đoàn kết dân tộc là đường lối chiến lược... động lực và nguồn lực to lớn..."</i><br>• <b>Đại hội XIII</b>: <i>"Phát huy sức mạnh đại đoàn kết... tăng cường pháp chế, bảo đảm kỷ cương xã hội"</i>.</td>
              </tr>
            </tbody>
          </table>
        </div>
      `,
    },

    attt: {
      id: "attt",
      title: "An Toàn Thông Tin",
      subtitle: `Hệ thống ôn luyện ${atttQuestions.length} câu`,
      icon: "🔐",
      iconClass: "attt-icon",
      storageKey: "attt_quiz_state_v1",
      searchPlaceholder: "🔍 Tìm kiếm từ khóa (ví dụ: RSA, DES, cổng 25, Virus, Firewall, Caesar...)",
      questions: atttQuestions,
      categories: [
        {
          id: "all",
          icon: "📚",
          name: `Toàn bộ ${atttQuestions.length} câu hỏi`,
          desc: "Đầy đủ 343 câu (Chương 1 + Chương 2)",
        },
        {
          id: "attt_numbers_calc",
          icon: "🔢",
          name: "Bộ 1: Con số, Bit, Cổng & Tính toán",
          desc: "Độ dài khóa/khối, số vòng, Port mạng, mod/cipher",
        },
        {
          id: "attt_classical",
          icon: "🔤",
          name: "Bộ 2: Mã hóa cổ điển & Thám mã",
          desc: "Caesar, Affine, Vigenère, Hill, Playfair, Hoán vị",
        },
        {
          id: "attt_modern_crypto",
          icon: "🔑",
          name: "Bộ 3: Mã hiện đại, Băm & Chữ ký số",
          desc: "DES, AES, RSA, Diffie-Hellman, MD5/SHA, PKI",
        },
        {
          id: "attt_malware",
          icon: "🦠",
          name: "Bộ 4: Mã độc & Nhận diện dấu hiệu",
          desc: "Virus, Worm, Trojan, Ransomware, Spyware, Rootkit",
        },
        {
          id: "attt_attacks",
          icon: "⚔️",
          name: "Bộ 5: Tấn công mạng & Lỗ hổng",
          desc: "DoS/DDoS, MITM, Phishing, SQLi, Brute Force, Sniffing",
        },
        {
          id: "attt_firewall_net",
          icon: "🛡️",
          name: "Bộ 6: Tường lửa, Luật lọc gói & Giao thức",
          desc: "Firewall, ISA Server, IDS/IPS, VPN, SSL/TLS, TCP/UDP",
        },
        {
          id: "attt_cia_policy",
          icon: "👤",
          name: "Bộ 7: CIA, Xác thực, Phân quyền & Chính sách",
          desc: "Bảo mật/Toàn vẹn/Sẵn sàng, Kerberos, RBAC, Backup",
        },
        {
          id: "wrong_only",
          icon: "❌",
          name: "Câu đang làm sai",
          desc: "Xem lại hoặc bấm Làm lại câu sai",
        },
        {
          id: "starred_only",
          icon: "⭐",
          name: "Câu đã đánh dấu sao",
          desc: "Các câu khó bạn bấm ngôi sao lưu lại",
        },
      ],
      chapters: [
        { id: "ALL", name: "Tất cả các chương" },
        { id: "CHƯƠNG 1", name: "Chương 1 (116 câu)" },
        { id: "CHƯƠNG 2", name: "Chương 2 (227 câu)" },
      ],
      tagLabels: {
        attt_numbers_calc: "🔢 Bộ 1: Số, Port & Tính toán",
        attt_classical: "🔤 Bộ 2: Mã cổ điển",
        attt_modern_crypto: "🔑 Bộ 3: Mã hiện đại & PKI",
        attt_malware: "🦠 Bộ 4: Mã độc",
        attt_attacks: "⚔️ Bộ 5: Tấn công mạng",
        attt_firewall_net: "🛡️ Bộ 6: Firewall & Giao thức",
        attt_cia_policy: "👤 Bộ 7: CIA & Chính sách",
      },
      cheatsheetGroups: [
        { tag: "attt_numbers_calc", title: "🔢 Bộ 1: Con Số, Bit, Cổng (Port) & Tính Toán" },
        { tag: "attt_classical", title: "🔤 Bộ 2: Mã Hóa Cổ Điển & Thám Mã" },
        { tag: "attt_malware", title: "🦠 Bộ 4: Mã Độc (Virus, Worm, Trojan, Ransomware...)" },
        { tag: "attt_attacks", title: "⚔️ Bộ 5: Các Dạng Tấn Công Mạng & Lỗ Hổng" },
      ],
      trapNotesHtml: `
        <div class="cheat-card" style="border-color: rgba(56, 189, 248, 0.45);">
          <h3 style="color: #38bdf8;">⚡ Bảng Mẹo Nhớ Nhanh An Toàn Thông Tin (Hay ra thi nhất)</h3>
          <table class="cheat-table">
            <thead>
              <tr>
                <th style="width:28%">Chủ đề hay nhầm</th>
                <th>Thông số / Mẹo phân biệt nhanh</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><b>Thông số Bit & Vòng lặp</b></td>
                <td>• <b>DES</b>: Khối <span class="cheat-highlight">64 bit</span>, khóa hiệu dụng <span class="cheat-highlight">56 bit</span> (64 bit gồm 8 bit chẵn lẻ), <span class="cheat-highlight">16 vòng</span> Feistel.<br>• <b>AES</b>: Khối <span class="cheat-highlight">128 bit</span>, khóa <span class="cheat-highlight">128 / 192 / 256 bit</span> tương ứng <span class="cheat-highlight">10 / 12 / 14 vòng</span>.<br>• <b>MD5</b>: Băm ra <span class="cheat-highlight">128 bit</span> | <b>SHA-1</b>: <span class="cheat-highlight">160 bit</span> | <b>SHA-256</b>: <span class="cheat-highlight">256 bit</span>.<br>• <b>X.509</b>: Phiên bản phổ biến nhất là <span class="cheat-highlight">Version 3</span>.</td>
              </tr>
              <tr>
                <td><b>Cổng (Port) phổ biến</b></td>
                <td>• <b>FTP</b>: <span class="cheat-highlight">20 / 21</span> • <b>SSH</b>: <span class="cheat-highlight">22</span> • <b>Telnet</b>: <span class="cheat-highlight">23</span> • <b>SMTP</b> (gửi mail): <span class="cheat-highlight">25</span><br>• <b>DNS</b>: <span class="cheat-highlight">53</span> • <b>HTTP</b>: <span class="cheat-highlight">80</span> • <b>POP3</b>: <span class="cheat-highlight">110</span> • <b>IMAP</b>: <span class="cheat-highlight">143</span> • <b>HTTPS</b>: <span class="cheat-highlight">443</span></td>
              </tr>
              <tr>
                <td><b>Phân biệt 6 loại Mã độc</b></td>
                <td>• <b>Virus</b>: Phải <i>bám/chèn vào tệp chủ</i> mới lây.<br>• <b>Worm (Sâu)</b>: <i>Tự nhân bản và lan qua mạng</i> không cần tệp chủ.<br>• <b>Trojan</b>: <i>Ngụy trang</i> làm phần mềm hữu ích để lừa cài.<br>• <b>Ransomware</b>: <i>Mã hóa dữ liệu</i> đòi tiền chuộc.<br>• <b>Spyware / Keylogger</b>: <i>Âm thầm theo dõi / ghi phím</i> đánh cắp thông tin.<br>• <b>Rootkit</b>: <i>Ẩn mình sâu ở mức hệ thống/kernel</i>, chiếm quyền quản trị.</td>
              </tr>
              <tr>
                <td><b>Khóa & Chữ ký số</b></td>
                <td>• <b>Mã hóa công khai (gửi bí mật)</b>: Dùng <span class="cheat-highlight">khóa công khai người nhận</span> để mã hóa → người nhận dùng <span class="cheat-highlight">khóa riêng của mình</span> giải mã.<br>• <b>Chữ ký số</b>: Người gửi dùng <span class="cheat-highlight">khóa riêng của mình</span> để ký → mọi người dùng <span class="cheat-highlight">khóa công khai người gửi</span> để xác minh.<br>• <b>Độ an toàn</b>: RSA dựa vào <i>phân tích thừa số nguyên tố lớn</i>; Diffie-Hellman / ElGamal dựa vào <i>logarit rời rạc</i>; Merkle-Hellman dựa vào <i>bài toán xếp ba lô</i>.</td>
              </tr>
              <tr>
                <td><b>Bộ 3 CIA</b></td>
                <td>• <b>C (Confidentiality - Bảo mật/Bí mật)</b>: Chỉ người được phép mới đọc được (dùng mã hóa).<br>• <b>I (Integrity - Toàn vẹn)</b>: Dữ liệu không bị sửa đổi trái phép (dùng Hash / HMAC / Chữ ký số).<br>• <b>A (Availability - Sẵn sàng)</b>: Hệ thống luôn truy cập được khi cần (chống DoS/DDoS, backup).</td>
              </tr>
            </tbody>
          </table>
        </div>
      `,
    },
  };

  // =========================================================================
  // 3. QUẢN LÝ TRẠNG THÁI & LƯU TIẾN ĐỘ RIÊNG CHO TỪNG MÔN
  // =========================================================================

  const ACTIVE_SUBJ_KEY = "active_subject_v1";
  let currentSubjectId = "tthcm";
  try {
    const savedSubj = localStorage.getItem(ACTIVE_SUBJ_KEY);
    if (savedSubj && SUBJECTS[savedSubj]) currentSubjectId = savedSubj;
  } catch (e) {}

  let savedState = { answers: {}, starred: {} };
  let currentMode = "practice";
  let currentCategory = "all";
  let currentChapter = "ALL";
  let filteredQuestions = [];
  let currentIndex = 0;
  let shuffleOptionsEnabled = false;
  let optionPermutations = {};
  let retryQueueIds = null;

  function getSubject() {
    return SUBJECTS[currentSubjectId];
  }

  function loadSubjectState() {
    savedState = { answers: {}, starred: {} };
    try {
      const raw = localStorage.getItem(getSubject().storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        savedState.answers = parsed.answers || {};
        savedState.starred = parsed.starred || {};
      }
    } catch (e) {}
  }

  function saveState() {
    try {
      localStorage.setItem(getSubject().storageKey, JSON.stringify(savedState));
    } catch (e) {}
  }

  // =========================================================================
  // 4. DOM ELEMENTS
  // =========================================================================

  const sidebar = document.getElementById("sidebar");
  const sidebarBackdrop = document.getElementById("sidebarBackdrop");
  const btnCloseSidebar = document.getElementById("btnCloseSidebar");
  const brandIcon = document.getElementById("brandIcon");
  const brandTitle = document.getElementById("brandTitle");
  const brandSubtitle = document.getElementById("brandSubtitle");
  const categoryListEl = document.getElementById("categoryList");
  const chapterListEl = document.getElementById("chapterList");
  const currentSetBadge = document.getElementById("currentSetBadge");
  const progressCounter = document.getElementById("progressCounter");
  const progressBarFill = document.getElementById("progressBarFill");
  const statCorrect = document.getElementById("statCorrect");
  const statWrong = document.getElementById("statWrong");
  const statStarred = document.getElementById("statStarred");
  const btnRetryWrongTop = document.getElementById("btnRetryWrongTop");
  const btnRetryWrongSidebar = document.getElementById("btnRetryWrongSidebar");

  const viewPractice = document.getElementById("viewPractice");
  const viewFlashcard = document.getElementById("viewFlashcard");
  const viewList = document.getElementById("viewList");
  const viewCheatsheet = document.getElementById("viewCheatsheet");

  const qChapter = document.getElementById("qChapter");
  const qTypeBadge = document.getElementById("qTypeBadge");
  const qIdLabel = document.getElementById("qIdLabel");
  const btnStarQuestion = document.getElementById("btnStarQuestion");
  const qText = document.getElementById("qText");
  const optionsContainer = document.getElementById("optionsContainer");
  const feedbackBanner = document.getElementById("feedbackBanner");
  const btnPrev = document.getElementById("btnPrev");
  const btnNext = document.getElementById("btnNext");
  const gridDoneCount = document.getElementById("gridDoneCount");
  const questionGrid = document.getElementById("questionGrid");

  const fcBadges = document.getElementById("fcBadges");
  const fcQuestion = document.getElementById("fcQuestion");
  const fcAnswerBox = document.getElementById("fcAnswerBox");
  const fcAnswerText = document.getElementById("fcAnswerText");
  const fcAllOptions = document.getElementById("fcAllOptions");
  const flashcardBox = document.getElementById("flashcardBox");

  const searchInput = document.getElementById("searchInput");
  const chkHideAnswersInList = document.getElementById("chkHideAnswersInList");
  const listCountInfo = document.getElementById("listCountInfo");
  const questionsListView = document.getElementById("questionsListView");
  const cheatsheetContainer = document.getElementById("cheatsheetContainer");

  // =========================================================================
  // 5. SWITCH SUBJECT & FILTERING
  // =========================================================================

  function switchSubject(subjId) {
    if (!SUBJECTS[subjId]) return;
    currentSubjectId = subjId;
    try {
      localStorage.setItem(ACTIVE_SUBJ_KEY, subjId);
    } catch (e) {}

    loadSubjectState();
    currentCategory = "all";
    currentChapter = "ALL";
    currentIndex = 0;
    retryQueueIds = null;
    optionPermutations = {};
    if (shuffleOptionsEnabled) {
      buildOptionPermutations();
    }

    const subj = getSubject();
    if (brandIcon) {
      brandIcon.textContent = subj.icon;
      brandIcon.className = "brand-icon" + (subj.iconClass ? " " + subj.iconClass : "");
    }
    if (brandTitle) brandTitle.textContent = subj.title;
    if (brandSubtitle) brandSubtitle.textContent = subj.subtitle;
    if (searchInput) {
      searchInput.value = "";
      searchInput.placeholder = subj.searchPlaceholder;
    }

    document.querySelectorAll(".subject-btn, .quick-subj-tab").forEach((el) => {
      el.classList.toggle("active", el.dataset.subject === subjId);
    });

    applyFilter(true);
    closeMobileSidebar();
  }

  function buildOptionPermutations() {
    optionPermutations = {};
    getSubject().questions.forEach((q) => {
      const keys = ["A", "B", "C", "D"].filter((k) => q.options[k] && q.options[k].trim() !== "");
      for (let i = keys.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [keys[i], keys[j]] = [keys[j], keys[i]];
      }
      optionPermutations[q.id] = keys;
    });
  }

  function getAllWrongQuestions() {
    return getSubject().questions.filter((q) => {
      const ans = savedState.answers[q.id];
      return ans && ans !== q.answer;
    });
  }

  function startRetryWrongSession() {
    const wrongList = getAllWrongQuestions();
    if (wrongList.length === 0) {
      alert("Hiện tại bạn chưa có câu nào làm sai để làm lại!");
      return;
    }
    retryQueueIds = wrongList.map((q) => q.id);
    retryQueueIds.forEach((id) => {
      delete savedState.answers[id];
    });
    saveState();
    currentCategory = "retry_wrong";
    currentChapter = "ALL";
    if (currentMode !== "practice") {
      setMode("practice");
    }
    applyFilter(true);
    closeMobileSidebar();
  }

  function getQuestionsForFilter(catId, chapId) {
    const allQ = getSubject().questions;
    if (catId === "retry_wrong" && Array.isArray(retryQueueIds)) {
      const idSet = new Set(retryQueueIds);
      return allQ.filter((q) => idSet.has(q.id));
    }
    return allQ.filter((q) => {
      if (chapId !== "ALL" && q.chapter.toUpperCase() !== chapId.toUpperCase()) {
        return false;
      }
      if (catId === "all") return true;
      if (catId === "wrong_only") {
        const userAns = savedState.answers[q.id];
        return userAns && userAns !== q.answer;
      }
      if (catId === "starred_only") {
        return !!savedState.starred[q.id];
      }
      return q.tags && q.tags.includes(catId);
    });
  }

  function applyFilter(resetIdx = true) {
    filteredQuestions = getQuestionsForFilter(currentCategory, currentChapter);
    if (resetIdx) currentIndex = 0;
    if (currentIndex >= filteredQuestions.length) {
      currentIndex = Math.max(0, filteredQuestions.length - 1);
    }
    renderSidebar();
    renderCurrentView();
  }

  // =========================================================================
  // 6. RENDERING
  // =========================================================================

  function renderSidebar() {
    const subj = getSubject();
    categoryListEl.innerHTML = "";
    subj.categories.forEach((cat) => {
      const count = getQuestionsForFilter(cat.id, currentChapter).length;
      const btn = document.createElement("button");
      btn.className = "cat-item" + (currentCategory === cat.id ? " active" : "");
      btn.innerHTML = `
        <div class="cat-item-left">
          <span>${cat.icon}</span>
          <div>
            <div>${cat.name}</div>
            <span class="cat-item-desc">${cat.desc}</span>
          </div>
        </div>
        <span class="cat-count">${count}</span>
      `;
      btn.addEventListener("click", () => {
        retryQueueIds = null;
        currentCategory = cat.id;
        if (currentMode === "cheatsheet") {
          setMode("practice");
        }
        applyFilter(true);
        closeMobileSidebar();
      });
      categoryListEl.appendChild(btn);
    });

    chapterListEl.innerHTML = "";
    subj.chapters.forEach((ch) => {
      const count = getQuestionsForFilter(currentCategory, ch.id).length;
      const btn = document.createElement("button");
      btn.className = "cat-item" + (currentChapter === ch.id ? " active" : "");
      btn.innerHTML = `
        <span>${ch.name}</span>
        <span class="cat-count">${count}</span>
      `;
      btn.addEventListener("click", () => {
        currentChapter = ch.id;
        applyFilter(true);
        closeMobileSidebar();
      });
      chapterListEl.appendChild(btn);
    });
  }

  function updateTopStats() {
    let correct = 0;
    let wrong = 0;
    let doneInSet = 0;

    filteredQuestions.forEach((q) => {
      const ans = savedState.answers[q.id];
      if (ans) {
        doneInSet++;
        if (ans === q.answer) correct++;
        else wrong++;
      }
    });

    const totalWrongAll = getAllWrongQuestions().length;
    const totalStarred = Object.keys(savedState.starred).filter((k) => savedState.starred[k]).length;
    statCorrect.textContent = correct;
    statWrong.textContent = wrong;
    statStarred.textContent = totalStarred;

    if (totalWrongAll > 0) {
      if (btnRetryWrongTop) {
        btnRetryWrongTop.classList.remove("hidden");
        btnRetryWrongTop.textContent = `🔁 Làm lại ${totalWrongAll} câu sai`;
      }
      if (btnRetryWrongSidebar) {
        btnRetryWrongSidebar.textContent = `🔁 Làm lại ${totalWrongAll} câu sai`;
      }
    } else {
      if (btnRetryWrongTop) btnRetryWrongTop.classList.add("hidden");
      if (btnRetryWrongSidebar) btnRetryWrongSidebar.textContent = "🔁 Làm lại các câu sai (0)";
    }

    if (currentCategory === "retry_wrong") {
      currentSetBadge.textContent = `🔁 Đang làm lại câu sai (${filteredQuestions.length} câu)`;
    } else {
      const activeCat = getSubject().categories.find((c) => c.id === currentCategory);
      const chapSuffix = currentChapter !== "ALL" ? ` (${currentChapter})` : "";
      currentSetBadge.textContent = (activeCat ? activeCat.name : "Bộ đề") + chapSuffix;
    }

    if (filteredQuestions.length > 0) {
      progressCounter.textContent = `Câu ${currentIndex + 1}/${filteredQuestions.length}`;
      const pct = Math.round(((currentIndex + 1) / filteredQuestions.length) * 100);
      progressBarFill.style.width = `${pct}%`;
    } else {
      progressCounter.textContent = "0/0 câu";
      progressBarFill.style.width = "0%";
    }

    gridDoneCount.textContent = `${doneInSet}/${filteredQuestions.length}`;
  }

  function renderPracticeQuestion() {
    updateTopStats();
    const tagLabels = getSubject().tagLabels;

    if (filteredQuestions.length === 0) {
      qChapter.textContent = "TRỐNG";
      qTypeBadge.classList.add("hidden");
      qIdLabel.textContent = "";
      qText.textContent =
        currentCategory === "wrong_only"
          ? "Chưa có câu nào sai! Khi bạn chọn sai một câu, câu đó sẽ tự động vào đây để bạn làm lại."
          : "Không có câu hỏi nào trong mục này.";
      optionsContainer.innerHTML = "";
      feedbackBanner.classList.add("hidden");
      questionGrid.innerHTML = "";
      return;
    }

    const q = filteredQuestions[currentIndex];
    qChapter.textContent = q.chapter;
    if (q.tags && q.tags.length > 0) {
      qTypeBadge.textContent = q.tags.map((t) => tagLabels[t] || t).join(" • ");
      qTypeBadge.classList.remove("hidden");
    } else {
      qTypeBadge.classList.add("hidden");
    }

    qIdLabel.textContent = `Câu gốc #${q.id}`;
    const isStar = !!savedState.starred[q.id];
    btnStarQuestion.textContent = isStar ? "★" : "☆";
    btnStarQuestion.classList.toggle("starred", isStar);

    qText.textContent = q.question;

    const baseKeys = ["A", "B", "C", "D"].filter((k) => q.options[k] && q.options[k].trim() !== "");
    const displayKeys =
      shuffleOptionsEnabled && optionPermutations[q.id] ? optionPermutations[q.id] : baseKeys;

    const userAns = savedState.answers[q.id];
    optionsContainer.innerHTML = "";

    displayKeys.forEach((origKey, idx) => {
      const displayLetter = ["A", "B", "C", "D"][idx];
      const btn = document.createElement("button");
      btn.className = "option-btn";
      if (userAns) {
        if (origKey === q.answer) {
          btn.classList.add("correct");
        } else if (origKey === userAns && userAns !== q.answer) {
          btn.classList.add("wrong");
        }
      }

      btn.innerHTML = `
        <span class="option-letter">${displayLetter}</span>
        <span class="option-text">${q.options[origKey]}</span>
      `;

      btn.addEventListener("click", () => {
        selectAnswer(q, origKey);
      });
      optionsContainer.appendChild(btn);
    });

    if (userAns) {
      feedbackBanner.classList.remove("hidden", "is-correct", "is-wrong");
      const correctDisplayIdx = displayKeys.indexOf(q.answer);
      const correctDisplayLetter = ["A", "B", "C", "D"][correctDisplayIdx] || q.answer;
      if (userAns === q.answer) {
        feedbackBanner.classList.add("is-correct");
        feedbackBanner.textContent = "✓ Chính xác!";
      } else {
        feedbackBanner.classList.add("is-wrong");
        feedbackBanner.textContent = `✗ Chưa đúng. Đáp án đúng là ${correctDisplayLetter}.`;
      }
    } else {
      feedbackBanner.classList.add("hidden");
    }

    btnPrev.disabled = currentIndex === 0;
    btnNext.disabled = currentIndex === filteredQuestions.length - 1;

    renderQuestionGrid();
  }

  function selectAnswer(q, chosenOrigKey) {
    savedState.answers[q.id] = chosenOrigKey;
    saveState();
    renderPracticeQuestion();
    renderSidebar();
  }

  function renderQuestionGrid() {
    questionGrid.innerHTML = "";
    filteredQuestions.forEach((q, idx) => {
      const cell = document.createElement("button");
      cell.className = "grid-cell";
      if (idx === currentIndex) cell.classList.add("current");
      const ans = savedState.answers[q.id];
      if (ans) {
        if (ans === q.answer) cell.classList.add("answered-correct");
        else cell.classList.add("answered-wrong");
      }
      if (savedState.starred[q.id]) cell.classList.add("starred");
      cell.textContent = idx + 1;
      cell.title = `Câu ${idx + 1} (Gốc #${q.id})`;
      cell.addEventListener("click", () => {
        currentIndex = idx;
        renderPracticeQuestion();
      });
      questionGrid.appendChild(cell);
    });
  }

  function renderFlashcard() {
    updateTopStats();
    fcAnswerBox.classList.add("hidden");
    if (filteredQuestions.length === 0) {
      fcBadges.innerHTML = "";
      fcQuestion.textContent = "Không có câu hỏi nào trong bộ lọc này.";
      return;
    }
    const q = filteredQuestions[currentIndex];
    fcBadges.innerHTML = `
      <span class="chapter-badge">${q.chapter}</span>
      <span class="q-id-label">Câu gốc #${q.id}</span>
    `;
    fcQuestion.textContent = q.question;
    fcAnswerText.textContent = `${q.answer}. ${q.options[q.answer]}`;
    const others = ["A", "B", "C", "D"]
      .filter((k) => q.options[k] && q.options[k].trim() !== "")
      .map((k) => `<div><b>${k}:</b> ${q.options[k]}</div>`)
      .join("");
    fcAllOptions.innerHTML = others;
  }

  function renderListView() {
    updateTopStats();
    const tagLabels = getSubject().tagLabels;
    const query = (searchInput.value || "").trim().toLowerCase();
    const hideAns = chkHideAnswersInList.checked;

    const list = filteredQuestions.filter((q) => {
      if (!query) return true;
      const inQ = q.question.toLowerCase().includes(query);
      const inOpts = Object.values(q.options).some((o) => (o || "").toLowerCase().includes(query));
      return inQ || inOpts || String(q.id) === query;
    });

    listCountInfo.textContent = `Hiển thị ${list.length} / ${filteredQuestions.length} câu hỏi trong bộ đang chọn`;
    questionsListView.innerHTML = "";

    list.forEach((q, idx) => {
      const card = document.createElement("div");
      card.className = "list-q-card";
      const tagPills = (q.tags || [])
        .map((t) => `<span class="type-badge">${tagLabels[t] || t}</span>`)
        .join("");

      const optsHtml = ["A", "B", "C", "D"]
        .filter((k) => q.options[k] && q.options[k].trim() !== "")
        .map((k) => {
          const isAns = !hideAns && k === q.answer;
          return `<div class="list-opt ${isAns ? "is-ans" : ""}"><b>${k}.</b> ${q.options[k]}</div>`;
        })
        .join("");

      card.innerHTML = `
        <div class="badges-row">
          <span class="chapter-badge">${q.chapter}</span>
          ${tagPills}
          <span class="q-id-label">#${q.id}</span>
        </div>
        <div class="list-q-title">Câu ${idx + 1}: ${q.question}</div>
        <div class="list-q-options">${optsHtml}</div>
      `;
      questionsListView.appendChild(card);
    });
  }

  function renderCheatsheet() {
    updateTopStats();
    const subj = getSubject();

    cheatsheetContainer.innerHTML =
      subj.trapNotesHtml +
      subj.cheatsheetGroups
        .map((g) => {
          const qs = subj.questions.filter((q) => q.tags && q.tags.includes(g.tag));
          const rows = qs
            .map(
              (q, i) => `
          <tr>
            <td>${i + 1}</td>
            <td><span class="chapter-badge">${q.chapter}</span></td>
            <td>${q.question}</td>
            <td class="cheat-highlight">${q.options[q.answer] || q.answer}</td>
          </tr>
        `
            )
            .join("");
          return `
        <div class="cheat-card">
          <h3>${g.title} (${qs.length} câu)</h3>
          <table class="cheat-table">
            <thead>
              <tr>
                <th style="width:45px">#</th>
                <th style="width:125px">Chương</th>
                <th>Câu hỏi / Dấu hiệu nhận biết</th>
                <th style="width:34%">Đáp án chuẩn</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      `;
        })
        .join("");
  }

  function setMode(mode) {
    currentMode = mode;
    document.querySelectorAll(".mode-btn").forEach((b) => {
      b.classList.toggle("active", b.dataset.mode === mode);
    });
    viewPractice.classList.toggle("hidden", mode !== "practice");
    viewFlashcard.classList.toggle("hidden", mode !== "flashcard");
    viewList.classList.toggle("hidden", mode !== "list");
    viewCheatsheet.classList.toggle("hidden", mode !== "cheatsheet");
    renderCurrentView();
  }

  function renderCurrentView() {
    if (currentMode === "practice") renderPracticeQuestion();
    else if (currentMode === "flashcard") renderFlashcard();
    else if (currentMode === "list") renderListView();
    else if (currentMode === "cheatsheet") renderCheatsheet();
  }

  function closeMobileSidebar() {
    sidebar.classList.remove("open");
    if (sidebarBackdrop) sidebarBackdrop.classList.remove("open");
  }

  function openMobileSidebar() {
    sidebar.classList.add("open");
    if (sidebarBackdrop) sidebarBackdrop.classList.add("open");
  }

  // =========================================================================
  // 7. EVENT LISTENERS
  // =========================================================================

  document.querySelectorAll(".subject-btn, .quick-subj-tab").forEach((btn) => {
    btn.addEventListener("click", () => switchSubject(btn.dataset.subject));
  });

  document.querySelectorAll(".mode-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      setMode(btn.dataset.mode);
      closeMobileSidebar();
    });
  });

  if (btnRetryWrongTop) btnRetryWrongTop.addEventListener("click", startRetryWrongSession);
  if (btnRetryWrongSidebar) btnRetryWrongSidebar.addEventListener("click", startRetryWrongSession);

  btnPrev.addEventListener("click", () => {
    if (currentIndex > 0) {
      currentIndex--;
      renderPracticeQuestion();
    }
  });

  btnNext.addEventListener("click", () => {
    if (currentIndex < filteredQuestions.length - 1) {
      currentIndex++;
      renderPracticeQuestion();
    }
  });

  btnStarQuestion.addEventListener("click", () => {
    if (!filteredQuestions[currentIndex]) return;
    const q = filteredQuestions[currentIndex];
    savedState.starred[q.id] = !savedState.starred[q.id];
    if (!savedState.starred[q.id]) delete savedState.starred[q.id];
    saveState();
    renderPracticeQuestion();
    renderSidebar();
  });

  flashcardBox.addEventListener("click", () => {
    fcAnswerBox.classList.toggle("hidden");
  });
  document.getElementById("btnFcFlip").addEventListener("click", () => {
    fcAnswerBox.classList.toggle("hidden");
  });
  document.getElementById("btnFcPrev").addEventListener("click", () => {
    if (currentIndex > 0) {
      currentIndex--;
      renderFlashcard();
    }
  });
  document.getElementById("btnFcNext").addEventListener("click", () => {
    if (currentIndex < filteredQuestions.length - 1) {
      currentIndex++;
      renderFlashcard();
    }
  });

  searchInput.addEventListener("input", renderListView);
  chkHideAnswersInList.addEventListener("change", renderListView);

  document.getElementById("btnShuffle").addEventListener("click", () => {
    for (let i = filteredQuestions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [filteredQuestions[i], filteredQuestions[j]] = [filteredQuestions[j], filteredQuestions[i]];
    }
    currentIndex = 0;
    renderCurrentView();
  });

  document.getElementById("btnShuffleOptions").addEventListener("click", (e) => {
    shuffleOptionsEnabled = !shuffleOptionsEnabled;
    if (shuffleOptionsEnabled) {
      buildOptionPermutations();
      e.currentTarget.textContent = "🔄 Đang đảo A/B/C/D (Bật)";
    } else {
      optionPermutations = {};
      e.currentTarget.textContent = "🔄 Đảo đáp án A/B/C/D";
    }
    renderCurrentView();
  });

  document.getElementById("btnResetProgress").addEventListener("click", () => {
    const subjTitle = getSubject().title;
    if (confirm(`Bạn có chắc muốn xóa lịch sử đúng/sai của môn "${subjTitle}" để làm lại từ đầu không?`)) {
      savedState.answers = {};
      retryQueueIds = null;
      if (currentCategory === "retry_wrong") currentCategory = "all";
      saveState();
      applyFilter(false);
    }
  });

  document.getElementById("btnToggleSidebar").addEventListener("click", () => {
    if (sidebar.classList.contains("open")) closeMobileSidebar();
    else openMobileSidebar();
  });

  if (btnCloseSidebar) btnCloseSidebar.addEventListener("click", closeMobileSidebar);
  if (sidebarBackdrop) sidebarBackdrop.addEventListener("click", closeMobileSidebar);

  // Keyboard shortcuts
  document.addEventListener("keydown", (e) => {
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

    if (currentMode === "practice" && filteredQuestions[currentIndex]) {
      const q = filteredQuestions[currentIndex];
      const baseKeys = ["A", "B", "C", "D"].filter((k) => q.options[k] && q.options[k].trim() !== "");
      const displayKeys =
        shuffleOptionsEnabled && optionPermutations[q.id] ? optionPermutations[q.id] : baseKeys;

      const keyMap = {
        "1": 0,
        "2": 1,
        "3": 2,
        "4": 3,
        a: 0,
        b: 1,
        c: 2,
        d: 3,
      };
      const kLower = e.key.toLowerCase();
      if (kLower in keyMap) {
        const idx = keyMap[kLower];
        if (idx < displayKeys.length) {
          e.preventDefault();
          selectAnswer(q, displayKeys[idx]);
        }
      } else if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        if (currentIndex < filteredQuestions.length - 1) {
          currentIndex++;
          renderPracticeQuestion();
        }
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (currentIndex > 0) {
          currentIndex--;
          renderPracticeQuestion();
        }
      } else if (kLower === "s") {
        e.preventDefault();
        btnStarQuestion.click();
      }
    } else if (currentMode === "flashcard") {
      if (e.key === " ") {
        e.preventDefault();
        fcAnswerBox.classList.toggle("hidden");
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        document.getElementById("btnFcNext").click();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        document.getElementById("btnFcPrev").click();
      }
    }
  });

  // Initialize active subject
  switchSubject(currentSubjectId);
})();
