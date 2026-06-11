import type { Lesson } from '../types'
import { studentDialogueOverrides } from './lessonDialogues'

const lessonPool: Lesson[] = [
  {
    id: 'campus-greeting',
    title: '校园里打招呼',
    level: 'N5',
    tags: ['校园', '交际'],
    scenario:
      '早晨在校门口遇到同学，互相问候并简单询问昨天作业。这类对话听力与日常题中极常见。',
    dialogue: [
      {
        speaker: '小田',
        ja: 'おはよう、田中くん。昨日の宿題、やった？',
        zh: '早呀，田中。昨天的作业做了吗？',
      },
      {
        speaker: '田中',
        ja: 'うん、終わったよ。小田さんは？',
        zh: '嗯，做完了。小田你呢？',
      },
      {
        speaker: '小田',
        ja: 'まだちょっと。放課後一緒に見てくれる？',
        zh: '还差一点点。放学后能一起看看吗？',
      },
      {
        speaker: '田中',
        ja: 'いいよ。図書館で待ってるね。',
        zh: '可以啊。我在图书馆等你。',
      },
    ],
    vocabulary: [
      { word: '宿題', reading: 'しゅくだい', meaning: '作业' },
      { word: '終わる', reading: 'おわる', meaning: '结束、做完' },
      { word: '放課後', reading: 'ほうかご', meaning: '放学后' },
      { word: '図書館', reading: 'としょかん', meaning: '图书馆' },
      { word: 'おはよう', reading: 'おはよう', meaning: '早上好' },
      { word: 'まだ', reading: '', meaning: '还/仍然' },
      { word: '一緒に', reading: 'いっしょに', meaning: '一起' },
      { word: '待つ', reading: 'まつ', meaning: '等候' },
    ],
    grammar:
      '「～た？」表示过去疑问（做了吗）；「～てくれる？」请求对方为自己做某事，口语里很实用。',
    examTip:
      '听力短对话里常考「请求／回应」的语气：いいよ、大丈夫、ちょっと…。注意否定与推辞的区别。',
    quizzes: [
      {
        id: 'q1',
        prompt: '「昨日の宿題、やった？」最贴近的中文意思是？',
        options: ['昨天的作业写了吗？', '昨天的作业很难吗？', '昨天的作业交了吗？', '昨天的作业是什么？'],
        correctIndex: 0,
      },
      {
        id: 'q2',
        prompt: '田中最后说「図書館で待ってるね」，说话者的意图是？',
        options: ['约在图书馆见面', '拒绝一起去', '请对方去教室', '今天不去图书馆'],
        correctIndex: 0,
      },
      {
        id: 'q3',
        prompt: '「放課後一緒に見てくれる？」中「～てくれる」表达的是？',
        options: ['请求对方帮忙看一下', '命令对方必须看', '表示自己帮对方看', '询问对方能否看见'],
        correctIndex: 0,
      },
    ],
  },
  {
    id: 'asking-directions',
    title: '问路：～はどこですか',
    level: 'N5',
    tags: ['出行', '问路'],
    scenario:
      '在街上找不到目的地，向路人询问地点。最基础的问路句型之一，几乎所有入门课程都会覆盖。',
    dialogue: [
      { speaker: '你', ja: 'すみません。駅はどこですか。', zh: '不好意思，车站在哪里？' },
      { speaker: '路人', ja: 'この道をまっすぐ行って、右です。', zh: '沿这条路直走，然后右转。' },
      { speaker: '你', ja: 'ありがとうございます。', zh: '谢谢！' },
      { speaker: '路人', ja: 'どういたしまして。', zh: '不客气。' },
    ],
    vocabulary: [
      { word: '駅', reading: 'えき', meaning: '车站' },
      { word: '道', reading: 'みち', meaning: '道路' },
      { word: 'まっすぐ', reading: '', meaning: '笔直、直走' },
      { word: '右', reading: 'みぎ', meaning: '右边' },
      { word: 'すみません', reading: '', meaning: '不好意思/对不起（搭话）' },
      { word: '行く', reading: 'いく', meaning: '去/走' },
      { word: 'ありがとうございます', reading: '', meaning: '谢谢' },
      { word: 'どういたしまして', reading: '', meaning: '不客气' },
    ],
    grammar:
      '「～はどこですか」询问地点；「～て、～です」按步骤说明路线（先…然后…）。',
    examTip:
      '听力问路题常考方向词：右・左・まっすぐ。先抓住“目的地名词 + はどこ”再听指路信息。',
    quizzes: [
      {
        id: 'q1',
        prompt: '「駅はどこですか」最贴近的中文意思是？',
        options: ['车站在哪里？', '去车站吗？', '车站很远吗？', '车站几点开？'],
        correctIndex: 0,
      },
      {
        id: 'q2',
        prompt: '「この道をまっすぐ行って、右です」表达的路线是？',
        options: ['直走后右转', '直走后左转', '右转后直走', '原地右边就是'],
        correctIndex: 0,
      },
      {
        id: 'q3',
        prompt: '对方说「どういたしまして」时，合适的场景是？',
        options: ['回应感谢', '表达拒绝', '请求别人帮忙', '表示不确定'],
        correctIndex: 0,
      },
    ],
  },
  {
    id: 'n4_reason_because_first_time',
    title: '说明理由：～だったから',
    level: 'N4',
    tags: ['表达', '理由'],
    scenario:
      '说明自己为什么会有某种反应或做某件事。「～だったから」是非常高频的理由表达。',
    dialogue: [
      { speaker: '你', ja: '初めてだったから、びっくりしました。', zh: '因为是第一次，所以吓了一跳。' },
      { speaker: '朋友', ja: 'そうなんだ。大丈夫？', zh: '这样啊。没事吧？' },
      { speaker: '你', ja: 'うん、もう大丈夫。', zh: '嗯，现在没事了。' },
    ],
    vocabulary: [
      { word: '初めて', reading: 'はじめて', meaning: '第一次' },
      { word: 'びっくりする', reading: '', meaning: '吃惊/吓一跳' },
      { word: '～から', reading: '', meaning: '因为…（理由）' },
      { word: '大丈夫', reading: 'だいじょうぶ', meaning: '没问题/没事' },
      { word: 'そうなんだ', reading: '', meaning: '原来如此' },
      { word: 'もう', reading: '', meaning: '已经/再' },
      { word: 'しました', reading: '', meaning: '做了/发生了（过去）' },
      { word: 'だった', reading: '', meaning: '是…（过去）' },
    ],
    grammar:
      '「～だったから、～」表示“因为…所以…”。也可用「～ので」更委婉。',
    examTip:
      '理由题要抓「から/ので」。听到理由后面的结论（びっくりしました等）通常是答案关键。',
    quizzes: [
      {
        id: 'q1',
        prompt: '「初めてだったから」最贴近的中文意思是？',
        options: ['因为是第一次', '虽然是第一次', '如果是第一次', '不是第一次'],
        correctIndex: 0,
      },
      {
        id: 'q2',
        prompt: '「びっくりしました」表示？',
        options: ['吓了一跳/很吃惊', '很高兴', '很生气', '很无聊'],
        correctIndex: 0,
      },
      {
        id: 'q3',
        prompt: '下列哪个更委婉地表示理由？',
        options: ['～ので', '～ろ', '～な', '～たい'],
        correctIndex: 0,
      },
    ],
  },
  {
    id: 'n4_compare_outside_better',
    title: '比较：外のほうがいいです',
    level: 'N4',
    tags: ['表达', '比较'],
    scenario:
      '在两种选择中表达偏好。“Aのほうが～”是比较句型的核心。',
    dialogue: [
      { speaker: '朋友', ja: '中と外、どっちがいい？', zh: '室内和室外，哪个好？' },
      { speaker: '你', ja: '外のほうがいいです。', zh: '外面更好。' },
      { speaker: '朋友', ja: 'じゃあ、外にしよう。', zh: '那就选外面吧。' },
    ],
    vocabulary: [
      { word: '外', reading: 'そと', meaning: '外面' },
      { word: '中', reading: 'なか', meaning: '里面' },
      { word: 'どっち', reading: '', meaning: '哪个（口语）' },
      { word: 'ほう', reading: '', meaning: '（比较）更…的一方' },
      { word: 'いい', reading: '', meaning: '好' },
      { word: '外にする', reading: 'そとにする', meaning: '选外面' },
      { word: 'じゃあ', reading: '', meaning: '那么' },
      { word: 'しよう', reading: '', meaning: '我们…吧（意向）' },
    ],
    grammar:
      '「AのほうがBより～」表示“A比B更…”。口语省略B也很常见。',
    examTip:
      '比较题常同时出现「ほうが」「より」。注意主观偏好不等于客观事实。',
    quizzes: [
      {
        id: 'q1',
        prompt: '「外のほうがいいです」表示？',
        options: ['外面更好', '外面不好', '外面很远', '去外面吗'],
        correctIndex: 0,
      },
      {
        id: 'q2',
        prompt: '「ほう」在比较句中表示？',
        options: ['更…的一方', '方法', '方向', '时间'],
        correctIndex: 0,
      },
      {
        id: 'q3',
        prompt: '「じゃあ、外にしよう」意图是？',
        options: ['做决定：选外面', '拒绝外面', '询问外面', '描述外面'],
        correctIndex: 0,
      },
    ],
  },
  {
    id: 'n4_wait_how_long',
    title: '要等多久：どのくらい待ちますか',
    level: 'N4',
    tags: ['出行', '时间'],
    scenario:
      '在排队、办事、等车时询问需要等待多久。高频时间表达。',
    dialogue: [
      { speaker: '你', ja: 'すみません、どのくらい待ちますか。', zh: '不好意思，要等多久？' },
      { speaker: '工作人员', ja: 'だいたい二十分ぐらいです。', zh: '大概20分钟左右。' },
      { speaker: '你', ja: 'わかりました。', zh: '明白了。' },
    ],
    vocabulary: [
      { word: 'どのくらい', reading: '', meaning: '多久/多少程度' },
      { word: '待つ', reading: 'まつ', meaning: '等候' },
      { word: 'だいたい', reading: '', meaning: '大概' },
      { word: '二十分', reading: 'にじゅっぷん', meaning: '20分钟' },
      { word: 'ぐらい', reading: '', meaning: '左右/大约' },
      { word: 'すみません', reading: '', meaning: '不好意思' },
      { word: 'わかりました', reading: '', meaning: '明白了' },
      { word: '待ちますか', reading: 'まちますか', meaning: '要等吗/等多久' },
    ],
    grammar:
      '「どのくらい＋动词」询问程度/时长；「～ぐらい」表示大约。',
    examTip:
      '时间题要抓数字和单位：分（ふん/ぷん）。「二十分」读にじゅっぷん。',
    quizzes: [
      {
        id: 'q1',
        prompt: '「どのくらい待ちますか」表示？',
        options: ['要等多久？', '要不要等？', '在哪里等？', '什么时候等？'],
        correctIndex: 0,
      },
      {
        id: 'q2',
        prompt: '「だいたい二十分ぐらい」表示？',
        options: ['大概20分钟左右', '差不多2分钟', '大概20小时', '大概200分钟'],
        correctIndex: 0,
      },
      {
        id: 'q3',
        prompt: '「ぐらい」的作用是？',
        options: ['表示大约/左右', '表示肯定', '表示过去', '表示否定'],
        correctIndex: 0,
      },
    ],
  },
  {
    id: 'n3_hearsay_concert',
    title: '听说：～そうです',
    level: 'N3',
    tags: ['表达', '传闻'],
    scenario:
      '把听到的消息转述给别人。「～そうです」是N3开始高频出现的传闻表达。',
    dialogue: [
      { speaker: '你', ja: 'またコンサートがあるそうです。', zh: '听说还会有演唱会。' },
      { speaker: '朋友', ja: '本当？いつ？', zh: '真的？什么时候？' },
      { speaker: '你', ja: '来月だそうです。', zh: '听说是下个月。' },
    ],
    vocabulary: [
      { word: 'そうです', reading: '', meaning: '听说…/据说…（传闻）' },
      { word: 'また', reading: '', meaning: '又/还' },
      { word: 'コンサート', reading: '', meaning: '演唱会/音乐会' },
      { word: 'ある', reading: '', meaning: '有/举行' },
      { word: '本当', reading: 'ほんとう', meaning: '真的' },
      { word: '来月', reading: 'らいげつ', meaning: '下个月' },
      { word: 'いつ', reading: '', meaning: '什么时候' },
      { word: 'だそうです', reading: '', meaning: '听说是…（礼貌转述）' },
    ],
    grammar:
      '「普通形＋そうです」表示传闻（据说…）；注意与「～そう（样态）」区分。',
    examTip:
      'N3常考「そうです」两种用法：传闻 vs 样态。看到/听到线索不同，语法也不同。',
    quizzes: [
      {
        id: 'q1',
        prompt: '「あるそうです」表示？',
        options: ['听说会有/会举行', '看起来有', '想要有', '必须有'],
        correctIndex: 0,
      },
      {
        id: 'q2',
        prompt: '「来月だそうです」表示？',
        options: ['听说是下个月', '下个月看起来', '下个月想去', '下个月必须去'],
        correctIndex: 0,
      },
      {
        id: 'q3',
        prompt: '传闻用法的「そうです」接在什么后面？',
        options: ['普通形', 'ます形', 'ない形', '命令形'],
        correctIndex: 0,
      },
    ],
  },
  {
    id: 'n3_plan_intend_to_give',
    title: '打算：～つもりです',
    level: 'N3',
    tags: ['表达', '计划'],
    scenario:
      '表达明确计划/打算。「～つもりです」是N3常考语法。',
    dialogue: [
      { speaker: '你', ja: '田中くんに渡すつもりです。', zh: '我打算交给田中。' },
      { speaker: '朋友', ja: 'そうなんだ。いつ渡すの？', zh: '这样啊。什么时候给他？' },
      { speaker: '你', ja: '明日渡します。', zh: '明天给。' },
    ],
    vocabulary: [
      { word: 'つもりです', reading: '', meaning: '打算…' },
      { word: '渡す', reading: 'わたす', meaning: '交给/递给' },
      { word: '明日', reading: 'あした', meaning: '明天' },
      { word: 'いつ', reading: '', meaning: '什么时候' },
      { word: 'そうなんだ', reading: '', meaning: '原来如此' },
      { word: '渡します', reading: 'わたします', meaning: '给（礼貌）' },
      { word: 'に', reading: '', meaning: '给…（对象）' },
      { word: 'さん', reading: '', meaning: '先生/女士（敬称）' },
    ],
    grammar:
      '「动词辞书形＋つもりです」表示打算；也可用「ないつもりです」表示不打算。',
    examTip:
      '「つもり」强调“意向已经定下”。与「～たい」(愿望) 的确定度不同。',
    quizzes: [
      {
        id: 'q1',
        prompt: '「渡すつもりです」表示？',
        options: ['打算交给/递给', '已经交给了', '想要得到', '必须交给'],
        correctIndex: 0,
      },
      {
        id: 'q2',
        prompt: '「いつ渡すの？」是在问？',
        options: ['什么时候交给', '在哪里交给', '交给谁', '为什么交给'],
        correctIndex: 0,
      },
      {
        id: 'q3',
        prompt: '「つもりです」更接近哪种语气？',
        options: ['明确计划/打算', '临时想到', '可能会', '禁止'],
        correctIndex: 0,
      },
    ],
  },
  {
    id: 'n2_polite_request_check_japanese',
    title: '较正式请求：チェックしてもらえませんか',
    level: 'N2',
    tags: ['学校', '请求'],
    scenario:
      '请对方帮忙确认内容（邮件/日语表达）。N2常见更礼貌的请求句型。',
    dialogue: [
      { speaker: '你', ja: 'すみません、日本語をチェックしてもらえませんか。', zh: '不好意思，能帮我确认一下日语吗？' },
      { speaker: '山本先生', ja: 'いいですよ。あとで送ってください。', zh: '可以。等会儿发给我。' },
      { speaker: '你', ja: 'ありがとうございます。助かります。', zh: '谢谢，帮大忙了。' },
    ],
    vocabulary: [
      { word: 'チェックする', reading: '', meaning: '检查/确认' },
      { word: 'もらえませんか', reading: '', meaning: '能不能…（更礼貌请求）' },
      { word: '送る', reading: 'おくる', meaning: '发送/寄' },
      { word: 'あとで', reading: '', meaning: '之后/等会儿' },
      { word: '助かります', reading: 'たすかります', meaning: '帮大忙了' },
      { word: 'すみません', reading: '', meaning: '不好意思' },
      { word: '日本語', reading: 'にほんご', meaning: '日语' },
      { word: 'ありがとうございます', reading: '', meaning: '谢谢' },
    ],
    grammar:
      '「～てもらえませんか」比「～てください」更委婉、礼貌，常用于正式请求。',
    examTip:
      'N2礼貌表达常考“委婉否定疑问句”。看到「もらえませんか」要理解为“能否帮我…”。',
    quizzes: [
      {
        id: 'q1',
        prompt: '「チェックしてもらえませんか」更接近？',
        options: ['能帮我确认一下吗（礼貌请求）', '我不能确认', '请你立刻确认（命令）', '我已经确认了'],
        correctIndex: 0,
      },
      {
        id: 'q2',
        prompt: '山本老师说「あとで送ってください」意图是？',
        options: ['让对方之后再发', '拒绝帮忙', '让对方马上走', '询问送到哪里'],
        correctIndex: 0,
      },
      {
        id: 'q3',
        prompt: '「助かります」表示？',
        options: ['帮大忙了/非常感谢', '很麻烦', '不需要', '很讨厌'],
        correctIndex: 0,
      },
    ],
  },
  {
    id: 'which-train-to-ikebukuro',
    title: '这班电车去池袋吗：～に行きますか',
    level: 'N5',
    tags: ['出行', '交通'],
    scenario:
      '在车站确认这趟电车是否开往目的地。听力里常考“确认线路/方向”。',
    dialogue: [
      { speaker: '你', ja: 'すみません。この電車は池袋に行きますか。', zh: '不好意思，这班电车去池袋吗？' },
      { speaker: '站员', ja: 'はい、行きます。次は新宿です。', zh: '是的，会去。下一站是新宿。' },
      { speaker: '你', ja: 'ありがとうございます。', zh: '谢谢。' },
    ],
    vocabulary: [
      { word: '電車', reading: 'でんしゃ', meaning: '电车' },
      { word: '池袋', reading: 'いけぶくろ', meaning: '池袋' },
      { word: '行く', reading: 'いく', meaning: '去' },
      { word: '次', reading: 'つぎ', meaning: '下一个/下一站' },
      { word: '新宿', reading: 'しんじゅく', meaning: '新宿' },
      { word: 'すみません', reading: '', meaning: '不好意思' },
      { word: 'はい', reading: '', meaning: '是的' },
      { word: 'ありがとうございます', reading: '', meaning: '谢谢' },
    ],
    grammar:
      '「AはBに行きますか」确认是否去某地；「次は～です」用于报站/顺序说明。',
    examTip:
      '听力里先抓目的地名词（池袋/新宿），再听肯定/否定（行きます／行きません）。',
    quizzes: [
      {
        id: 'q1',
        prompt: '「この電車は池袋に行きますか」是在问？',
        options: ['这班电车去池袋吗', '这班电车几点来', '池袋在哪里', '我要去池袋'],
        correctIndex: 0,
      },
      {
        id: 'q2',
        prompt: '站员说「次は新宿です」表示？',
        options: ['下一站是新宿', '下一班车去新宿', '现在在新宿', '新宿很近'],
        correctIndex: 0,
      },
      {
        id: 'q3',
        prompt: '用于确认目的地方向，常用的句型是？',
        options: ['～に行きますか', '～が好きです', '～があります', '～ましょう'],
        correctIndex: 0,
      },
    ],
  },
  {
    id: 'how-to-do-it',
    title: '怎么弄：どうやってするんですか',
    level: 'N5',
    tags: ['日常', '求助'],
    scenario:
      '遇到不会操作的事情（机器、软件、流程）时，礼貌询问方法。适用于很多生活场景。',
    dialogue: [
      { speaker: '你', ja: 'すみません、どうやってするんですか。', zh: '不好意思，这个怎么弄？' },
      { speaker: '对方', ja: 'ここを押して、次にこのボタンです。', zh: '按这里，然后按这个按钮。' },
      { speaker: '你', ja: 'なるほど、ありがとうございます。', zh: '原来如此，谢谢。' },
    ],
    vocabulary: [
      { word: 'どうやって', reading: '', meaning: '怎么/如何' },
      { word: '押す', reading: 'おす', meaning: '按/按下' },
      { word: '次に', reading: 'つぎに', meaning: '接着/然后' },
      { word: 'ボタン', reading: '', meaning: '按钮' },
      { word: 'なるほど', reading: '', meaning: '原来如此' },
      { word: 'すみません', reading: '', meaning: '不好意思' },
      { word: 'ここ', reading: '', meaning: '这里' },
      { word: 'する', reading: '', meaning: '做/操作' },
    ],
    grammar:
      '「どうやって＋动词」询问方法；「～て、次に～」按步骤说明操作流程。',
    examTip:
      '口语里「どうやってするんですか」语气很常见。听力题常把步骤词作为关键信息：まず/次に/最後に。',
    quizzes: [
      {
        id: 'q1',
        prompt: '「どうやってするんですか」更接近？',
        options: ['怎么操作？', '多少钱？', '在哪里？', '什么时候？'],
        correctIndex: 0,
      },
      {
        id: 'q2',
        prompt: '「ここを押して、次にこのボタンです」表达的是？',
        options: ['按步骤说明操作', '表达拒绝', '说明原因', '表达愿望'],
        correctIndex: 0,
      },
      {
        id: 'q3',
        prompt: '「なるほど」常用于？',
        options: ['表示理解/恍然大悟', '道歉', '拒绝', '请求许可'],
        correctIndex: 0,
      },
    ],
  },
  {
    id: 'invite-photo',
    title: '邀请：写真を撮りましょう',
    level: 'N5',
    tags: ['出行', '邀请'],
    scenario:
      '和朋友旅行时提出建议“一起拍照吧”。「～ましょう」是最基础的邀请/提议表达。',
    dialogue: [
      { speaker: '你', ja: 'きれいですね。写真を撮りましょう。', zh: '好漂亮啊。我们拍张照吧。' },
      { speaker: '朋友', ja: 'いいですね。お願いします。', zh: '好呀。拜托你了。' },
      { speaker: '你', ja: 'はい、チーズ！', zh: '好，茄子！' },
    ],
    vocabulary: [
      { word: 'きれい', reading: '', meaning: '漂亮/干净' },
      { word: '写真', reading: 'しゃしん', meaning: '照片' },
      { word: '撮る', reading: 'とる', meaning: '拍（照）' },
      { word: '～ましょう', reading: '', meaning: '…吧（提议）' },
      { word: 'いいですね', reading: '', meaning: '好呀/不错' },
      { word: 'お願いします', reading: 'おねがいします', meaning: '拜托了/麻烦你' },
      { word: 'はい', reading: '', meaning: '好' },
      { word: 'チーズ', reading: '', meaning: 'cheese（拍照口令）' },
    ],
    grammar:
      '「动词ます形去ます＋ましょう」用于邀请/提议；「いいですね」表示赞同。',
    examTip:
      '「～ましょう」是软性邀请；如果想更委婉可用「～ませんか」。注意两者语气差异。',
    quizzes: [
      {
        id: 'q1',
        prompt: '「写真を撮りましょう」表达的是？',
        options: ['提议一起拍照', '禁止拍照', '正在拍照', '询问能否拍照'],
        correctIndex: 0,
      },
      {
        id: 'q2',
        prompt: '对方说「いいですね」表示？',
        options: ['赞同/觉得不错', '拒绝', '生气', '不确定'],
        correctIndex: 0,
      },
      {
        id: 'q3',
        prompt: '更委婉的邀请表达是？',
        options: ['～ませんか', '～ろ', '～なさい', '～たい'],
        correctIndex: 0,
      },
    ],
  },
  {
    id: 'invite-go-together',
    title: '一起去吧：一緒に行きませんか',
    level: 'N4',
    tags: ['出行', '邀请'],
    scenario:
      '更礼貌、委婉地邀请对方一起去某地。「～ませんか」比「～ましょう」更像在征求对方意愿。',
    dialogue: [
      { speaker: '你', ja: '今度、映画を見に行きませんか。', zh: '下次要不要一起去看电影？' },
      { speaker: '朋友', ja: 'いいですね。いつがいいですか。', zh: '好呀。什么时候合适？' },
      { speaker: '你', ja: '土曜日はどうですか。', zh: '周六怎么样？' },
    ],
    vocabulary: [
      { word: '今度', reading: 'こんど', meaning: '下次/这次' },
      { word: '映画', reading: 'えいが', meaning: '电影' },
      { word: '見に行く', reading: 'みにいく', meaning: '去看' },
      { word: '～ませんか', reading: '', meaning: '要不要…（邀请）' },
      { word: 'いつ', reading: '', meaning: '什么时候' },
      { word: '土曜日', reading: 'どようび', meaning: '周六' },
      { word: 'どうですか', reading: '', meaning: '怎么样' },
      { word: 'いいですね', reading: '', meaning: '好呀/不错' },
    ],
    grammar:
      '「动词ませんか」委婉邀请；「～はどうですか」提出时间/方案的建议。',
    examTip:
      '「～ませんか」不是真的否定，而是礼貌邀请。听力里要把它当作“建议/邀约”。',
    quizzes: [
      {
        id: 'q1',
        prompt: '「行きませんか」在这里表示？',
        options: ['要不要去呢（邀请）', '不去', '不能去', '去了没有'],
        correctIndex: 0,
      },
      {
        id: 'q2',
        prompt: '「土曜日はどうですか」的意图是？',
        options: ['建议周六', '拒绝周六', '说明周六有事', '询问周六天气'],
        correctIndex: 0,
      },
      {
        id: 'q3',
        prompt: '比「～ましょう」更像征求对方意见的是？',
        options: ['～ませんか', '～たい', '～ました', '～です'],
        correctIndex: 0,
      },
    ],
  },
  {
    id: 'i-want-gloves',
    title: '想买手套：～が欲しいんですが',
    level: 'N4',
    tags: ['购物', '表达愿望'],
    scenario:
      '在店里委婉说明“我想要买…”。「～が欲しいんですが」很自然，也方便引出店员推荐。',
    dialogue: [
      { speaker: '你', ja: 'すみません、手袋が欲しいんですが。', zh: '不好意思，我想买手套。' },
      { speaker: '店员', ja: 'はい。こちらはいかがですか。', zh: '好的。这款怎么样？' },
      { speaker: '你', ja: 'あ、いいですね。これにします。', zh: '啊不错。就要这个。' },
    ],
    vocabulary: [
      { word: '手袋', reading: 'てぶくろ', meaning: '手套' },
      { word: '欲しい', reading: 'ほしい', meaning: '想要' },
      { word: '～んですが', reading: '', meaning: '…（说明情况/引出请求）' },
      { word: 'こちら', reading: '', meaning: '这边/这款（礼貌）' },
      { word: 'いかがですか', reading: '', meaning: '怎么样（礼貌）' },
      { word: 'いいですね', reading: '', meaning: '不错' },
      { word: 'これにします', reading: '', meaning: '我就选这个' },
      { word: 'すみません', reading: '', meaning: '不好意思' },
    ],
    grammar:
      '「名词が欲しい」表达想要；「～んですが」用于委婉铺垫，常接请求/咨询。',
    examTip:
      '购物场景里「こちらはいかがですか」= 店员推荐。回答可用「これにします」「もう少し見ます」。',
    quizzes: [
      {
        id: 'q1',
        prompt: '「手袋が欲しいんですが」最贴近？',
        options: ['我想买手套', '我不要手套', '手套在哪里', '手套多少钱'],
        correctIndex: 0,
      },
      {
        id: 'q2',
        prompt: '店员说「こちらはいかがですか」意图是？',
        options: ['推荐这款', '拒绝售卖', '道歉', '要求离开'],
        correctIndex: 0,
      },
      {
        id: 'q3',
        prompt: '「これにします」表示？',
        options: ['就选这个', '不要这个', '这个可以吗', '这个太贵'],
        correctIndex: 0,
      },
    ],
  },
  {
    id: 'do-you-have-omamori',
    title: '有护身符吗：～はありますか',
    level: 'N5',
    tags: ['购物', '询问是否有'],
    scenario:
      '在店里询问是否有某样东西。「～はありますか」是最通用的“有没有”。',
    dialogue: [
      { speaker: '你', ja: 'すみません、お守りはありますか。', zh: '不好意思，有护身符吗？' },
      { speaker: '店员', ja: 'はい、あります。こちらです。', zh: '有的。这边请。' },
      { speaker: '你', ja: 'ありがとうございます。', zh: '谢谢。' },
    ],
    vocabulary: [
      { word: 'お守り', reading: 'おまもり', meaning: '护身符' },
      { word: 'ありますか', reading: '', meaning: '有吗' },
      { word: 'あります', reading: '', meaning: '有' },
      { word: 'こちら', reading: '', meaning: '这边' },
      { word: 'です', reading: '', meaning: '是' },
      { word: 'すみません', reading: '', meaning: '不好意思' },
      { word: 'はい', reading: '', meaning: '是的' },
      { word: 'ありがとうございます', reading: '', meaning: '谢谢' },
    ],
    grammar:
      '「名词はありますか」询问是否存在/是否有货；回答「あります／ありません」。',
    examTip:
      '听力里「ありますか」经常出现。要特别听清否定「ありません」。',
    quizzes: [
      {
        id: 'q1',
        prompt: '「お守りはありますか」是在问？',
        options: ['有没有护身符', '护身符多少钱', '护身符可爱吗', '护身符在哪里做'],
        correctIndex: 0,
      },
      {
        id: 'q2',
        prompt: '「あります」表示？',
        options: ['有', '没有', '想要', '买不起'],
        correctIndex: 0,
      },
      {
        id: 'q3',
        prompt: '表示“没有”的正确说法是？',
        options: ['ありません', 'あります', 'でした', 'ほしいです'],
        correctIndex: 0,
      },
    ],
  },
  {
    id: 'what-time-is-the-bath',
    title: '几点到几点：何時から何時までですか',
    level: 'N4',
    tags: ['出行', '时间'],
    scenario:
      '询问营业时间或开放时间。温泉、餐厅、展馆等都常用这个句型。',
    dialogue: [
      { speaker: '你', ja: 'すみません。お風呂は何時から何時までですか。', zh: '不好意思，浴场从几点到几点？' },
      { speaker: '工作人员', ja: '七時から九時までです。', zh: '从7点到9点。' },
      { speaker: '你', ja: 'わかりました。ありがとうございます。', zh: '明白了，谢谢。' },
    ],
    vocabulary: [
      { word: 'お風呂', reading: 'おふろ', meaning: '洗澡/浴场' },
      { word: '何時', reading: 'なんじ', meaning: '几点' },
      { word: 'から', reading: '', meaning: '从…（起点）' },
      { word: 'まで', reading: '', meaning: '到…为止' },
      { word: '七時', reading: 'しちじ', meaning: '7点' },
      { word: '九時', reading: 'くじ', meaning: '9点' },
      { word: 'わかりました', reading: '', meaning: '明白了' },
      { word: 'すみません', reading: '', meaning: '不好意思' },
    ],
    grammar:
      '「何時から何時まで」询问时间范围；「AからBまでです」回答时间区间。',
    examTip:
      '时间听力最怕读音混淆：しちじ/しちじ、くじ/きゅうじ等。抓住「から/まで」框住时间范围。',
    quizzes: [
      {
        id: 'q1',
        prompt: '「何時から何時までですか」用于？',
        options: ['询问开放/营业时间范围', '询问价格', '询问地点', '询问原因'],
        correctIndex: 0,
      },
      {
        id: 'q2',
        prompt: '「七時から九時までです」表示？',
        options: ['7点到9点', '9点到7点', '7点以后不行', '9点开始'],
        correctIndex: 0,
      },
      {
        id: 'q3',
        prompt: '「から」「まで」分别表示？',
        options: ['从…/到…', '和/或', '因为/所以', '如果/那么'],
        correctIndex: 0,
      },
    ],
  },
  {
    id: 'throat-hurts',
    title: '身体不适：のどが痛いんです',
    level: 'N4',
    tags: ['生活', '健康'],
    scenario:
      '去药店或跟朋友说明身体不舒服。用「～んです」解释现状，语气更自然。',
    dialogue: [
      { speaker: '你', ja: 'すみません、のどが痛いんです。', zh: '不好意思，我嗓子疼。' },
      { speaker: '店员', ja: '熱はありますか。', zh: '有发烧吗？' },
      { speaker: '你', ja: 'いいえ、ありません。', zh: '没有。' },
    ],
    vocabulary: [
      { word: 'のど', reading: '', meaning: '嗓子' },
      { word: '痛い', reading: 'いたい', meaning: '疼' },
      { word: '～んです', reading: '', meaning: '…（说明情况/原因）' },
      { word: '熱', reading: 'ねつ', meaning: '发烧/体温' },
      { word: 'ありますか', reading: '', meaning: '有吗' },
      { word: 'ありません', reading: '', meaning: '没有' },
      { word: 'すみません', reading: '', meaning: '不好意思' },
      { word: 'いいえ', reading: '', meaning: '不/不是' },
    ],
    grammar:
      '「名词が痛い」说明身体部位疼；「～んです」用于解释现状，让表达更自然。',
    examTip:
      '健康话题听力常考：痛い・熱・咳（せき）等。要听清肯定/否定回答。',
    quizzes: [
      {
        id: 'q1',
        prompt: '「のどが痛いんです」表示？',
        options: ['嗓子疼', '肚子疼', '头疼', '想喝水'],
        correctIndex: 0,
      },
      {
        id: 'q2',
        prompt: '「熱はありますか」是在问？',
        options: ['有没有发烧', '要不要休息', '吃不吃饭', '去不去医院'],
        correctIndex: 0,
      },
      {
        id: 'q3',
        prompt: '回答“没有发烧”应说？',
        options: ['いいえ、ありません', 'はい、あります', 'だめです', 'ほしいです'],
        correctIndex: 0,
      },
    ],
  },
  {
    id: 'lost-wallet',
    title: '把钱包弄丢了：財布を落としてしまいました',
    level: 'N4',
    tags: ['生活', '求助'],
    scenario:
      '丢了东西向工作人员求助。常用「～てしまいました」表达遗憾/不小心发生。',
    dialogue: [
      { speaker: '你', ja: 'すみません、財布を落としてしまいました。', zh: '不好意思，我把钱包弄丢了。' },
      { speaker: '工作人员', ja: 'いつ、どこで落としましたか。', zh: '什么时候、在哪里丢的？' },
      { speaker: '你', ja: 'さっき駅でです。', zh: '刚才在车站。' },
    ],
    vocabulary: [
      { word: '財布', reading: 'さいふ', meaning: '钱包' },
      { word: '落とす', reading: 'おとす', meaning: '弄掉/丢失' },
      { word: '～てしまいました', reading: '', meaning: '不小心…了/遗憾地…了' },
      { word: 'いつ', reading: '', meaning: '什么时候' },
      { word: 'どこで', reading: '', meaning: '在哪里（发生地点）' },
      { word: 'さっき', reading: '', meaning: '刚才' },
      { word: '駅', reading: 'えき', meaning: '车站' },
      { word: 'すみません', reading: '', meaning: '不好意思' },
    ],
    grammar:
      '「名词を落としてしまいました」表达不小心造成的结果；「どこで」询问动作发生地点。',
    examTip:
      '丢失物品场景里，问题常追问时间/地点。听力要抓「いつ」「どこで」对应答案。',
    quizzes: [
      {
        id: 'q1',
        prompt: '「落としてしまいました」包含的语气是？',
        options: ['遗憾/不小心发生', '命令', '邀请', '许可'],
        correctIndex: 0,
      },
      {
        id: 'q2',
        prompt: '「いつ、どこで落としましたか」是在问？',
        options: ['什么时候、在哪里丢的', '多少钱', '是谁的', '能不能买'],
        correctIndex: 0,
      },
      {
        id: 'q3',
        prompt: '「さっき」表示？',
        options: ['刚才', '明天', '经常', '马上（以后）'],
        correctIndex: 0,
      },
    ],
  },
  {
    id: 'self-introduction',
    title: '自我介绍：～です',
    level: 'N5',
    tags: ['交际', '初次见面'],
    scenario:
      '第一次见面介绍姓名与身份。用「～です」构句，语气简单但非常关键。',
    dialogue: [
      { speaker: '小田', ja: 'はじめまして。わたしは小田です。', zh: '初次见面。我叫小田。' },
      { speaker: '对方', ja: 'はじめまして。タナカです。', zh: '初次见面。我是田中。' },
      { speaker: '小田', ja: '留学生です。よろしくお願いします。', zh: '我是留学生。请多关照。' },
      { speaker: '对方', ja: 'こちらこそ、よろしく。', zh: '我才要请你多关照。' },
    ],
    vocabulary: [
      { word: 'はじめまして', reading: '', meaning: '初次见面' },
      { word: '留学生', reading: 'りゅうがくせい', meaning: '留学生' },
      { word: 'よろしくお願いします', reading: 'よろしくおねがいします', meaning: '请多关照' },
      { word: 'こちらこそ', reading: '', meaning: '我才是/彼此彼此' },
      { word: 'わたし', reading: '', meaning: '我' },
      { word: '～です', reading: '', meaning: '是…（判断句）' },
    ],
    grammar:
      '「AはBです」判断句；「わたしは～」明确主语；「よろしくお願いします」是固定寒暄语。',
    examTip:
      '口语里「～です」要读得清楚。听力自我介绍题常考职业/身份词：学生・留学生・先生等。',
    quizzes: [
      {
        id: 'q1',
        prompt: '「わたしは小田です」表示？',
        options: ['我叫小田', '我去小田那里', '我是日本人', '我是老师'],
        correctIndex: 0,
      },
      {
        id: 'q2',
        prompt: '「よろしくお願いします」更接近哪种意思？',
        options: ['请多关照', '再见', '不好意思', '没关系'],
        correctIndex: 0,
      },
      {
        id: 'q3',
        prompt: '对方说「こちらこそ」时最自然的中文理解是？',
        options: ['我才是/彼此彼此', '不对不对', '我先走了', '请再说一遍'],
        correctIndex: 0,
      },
    ],
  },
  {
    id: 'where-are-you-from',
    title: '来自哪里：～から来ました',
    level: 'N5',
    tags: ['交际', '自我介绍'],
    scenario:
      '在课堂或聚会里介绍自己的国家/城市。用「～から来ました」表达出身地。',
    dialogue: [
      { speaker: '对方', ja: 'どちらから来ましたか。', zh: '你从哪里来？' },
      { speaker: '你', ja: '中国から来ました。北京です。', zh: '我从中国来。来自北京。' },
      { speaker: '对方', ja: 'そうですか。ようこそ。', zh: '这样啊。欢迎。' },
    ],
    vocabulary: [
      { word: 'どちら', reading: '', meaning: '哪边/哪里（礼貌）' },
      { word: '中国', reading: 'ちゅうごく', meaning: '中国' },
      { word: '来る', reading: 'くる', meaning: '来' },
      { word: 'ようこそ', reading: '', meaning: '欢迎' },
      { word: '～から', reading: '', meaning: '从…（起点/来源）' },
      { word: '北京', reading: 'ぺきん', meaning: '北京' },
      { word: 'そうですか', reading: '', meaning: '这样啊/是吗' },
      { word: '来ました', reading: 'きました', meaning: '来了/从…来' },
    ],
    grammar:
      '「～から来ました」表示从…来（出身/来访地）；「～です」补充具体城市/身份。',
    examTip:
      '听到「どちらから」要立刻想到回答格式「〇〇から来ました」。国家/城市名要熟悉常见读音。',
    quizzes: [
      {
        id: 'q1',
        prompt: '「どちらから来ましたか」是在问？',
        options: ['从哪里来', '要去哪里', '什么时候来', '怎么来的'],
        correctIndex: 0,
      },
      {
        id: 'q2',
        prompt: '「中国から来ました」表示？',
        options: ['我从中国来', '我想去中国', '中国很远', '我在中国工作'],
        correctIndex: 0,
      },
      {
        id: 'q3',
        prompt: '「ようこそ」常用在？',
        options: ['欢迎对方到来', '拒绝对方请求', '表示抱歉', '请求对方帮忙'],
        correctIndex: 0,
      },
    ],
  },
  {
    id: 'please-speak-slowly',
    title: '请说慢一点：ゆっくり話してください',
    level: 'N5',
    tags: ['交际', '请求'],
    scenario:
      '对方语速太快听不懂时，请求放慢速度。非常实用且礼貌。',
    dialogue: [
      { speaker: '你', ja: 'すみません。もう一度、ゆっくり話してください。', zh: '不好意思，请再说一遍，慢一点。' },
      { speaker: '对方', ja: 'わかりました。ゆっくり話します。', zh: '明白了。我会说慢一点。' },
      { speaker: '你', ja: 'ありがとうございます。', zh: '谢谢。' },
    ],
    vocabulary: [
      { word: 'もう一度', reading: 'もういちど', meaning: '再一次' },
      { word: 'ゆっくり', reading: '', meaning: '慢慢地' },
      { word: '話す', reading: 'はなす', meaning: '说话' },
      { word: 'わかりました', reading: '', meaning: '明白了' },
      { word: 'すみません', reading: '', meaning: '不好意思' },
      { word: '話します', reading: 'はなします', meaning: '我来说（礼貌）' },
      { word: 'ありがとうございます', reading: '', meaning: '谢谢' },
    ],
    grammar:
      '「～てください」礼貌请求；副词「ゆっくり」修饰动作；「もう一度」表示重复。',
    examTip:
      '考试听力里「もう一度」常出现，表示对方没听清。注意「話してください」与「話します」的差异。',
    quizzes: [
      {
        id: 'q1',
        prompt: '「ゆっくり話してください」的意思是？',
        options: ['请说慢一点', '请别说话', '请写下来', '请大声一点'],
        correctIndex: 0,
      },
      {
        id: 'q2',
        prompt: '「もう一度」表示？',
        options: ['再一次', '马上', '一直', '刚才'],
        correctIndex: 0,
      },
      {
        id: 'q3',
        prompt: '下列哪个更礼貌、适合对陌生人？',
        options: ['～てください', '～ろ', '～な', '命令式直接说'],
        correctIndex: 0,
      },
    ],
  },
  {
    id: 'language-school-registration',
    title: '语言学校报到：受付はどこですか',
    level: 'N5',
    tags: ['校园', '初次见面', '交际'],
    scenario:
      '刚到语言学校办理入学登记，找不到受理处。不同班的同学小师主动帮忙指路，两人由此认识。',
    dialogue: [
      { speaker: '你', ja: 'すみません。受付はどこですか。', zh: '不好意思，受理处在哪里？' },
      { speaker: '同学', ja: '新入生？ 受付はあそこだよ。案内するね。', zh: '新生？受理处在那边。我带你去。' },
      { speaker: '你', ja: 'ありがとうございます。はじめまして、小田です。', zh: '谢谢。初次见面，我是小田。' },
      { speaker: '同学', ja: '小师だよ。クラスは違うけど、困ったら声かけて。', zh: '我是小师。虽然不同班，有困难就跟我说。' },
    ],
    vocabulary: [
      { word: '受付', reading: 'うけつけ', meaning: '受理处、前台' },
      { word: '新入生', reading: 'しんにゅうせい', meaning: '新生' },
      { word: '案内', reading: 'あんない', meaning: '引导、带路' },
      { word: 'クラス', reading: '', meaning: '班级' },
      { word: '困る', reading: 'こまる', meaning: '为难、遇到困难' },
      { word: '声をかける', reading: 'こえをかける', meaning: '搭话、打招呼' },
      { word: 'はじめまして', reading: '', meaning: '初次见面' },
      { word: '留学生', reading: 'りゅうがくせい', meaning: '留学生' },
    ],
    grammar:
      '「～はどこですか」询问地点；「～てください」礼貌请求；「～けど」表示转折（虽然…但是…）。',
    examTip:
      '入学、办事场景里「受付」和「すみません」几乎必考。听到「新入生」要想到报到/登记语境。',
    quizzes: [
      {
        id: 'q1',
        prompt: '「受付はどこですか」是在问？',
        options: ['受理处在哪里', '教室几点上课', '作业交了吗', '老师叫什么名字'],
        correctIndex: 0,
      },
      {
        id: 'q2',
        prompt: '小师说「クラスは違うけど」，意思是？',
        options: ['虽然不同班', '我们同班', '今天没课', '教室很远'],
        correctIndex: 0,
      },
      {
        id: 'q3',
        prompt: '「困ったら声かけて」更接近哪种意思？',
        options: ['有困难就跟我说', '请不要说话', '作业自己做', '放学后再见'],
        correctIndex: 0,
      },
    ],
  },
  {
    id: 'what-is-this',
    title: '这是什么：これは何ですか',
    level: 'N5',
    tags: ['购物', '日常'],
    scenario:
      '在店里或朋友家看到不认识的物品，询问名称。配合指示词「これ/それ/あれ」。',
    dialogue: [
      { speaker: '你', ja: 'すみません、これは何ですか。', zh: '不好意思，这是什么？' },
      { speaker: '店员', ja: 'それはお守りです。', zh: '那是护身符。' },
      { speaker: '你', ja: 'そうですか。かわいいですね。', zh: '这样啊。好可爱。' },
    ],
    vocabulary: [
      { word: 'これ', reading: '', meaning: '这个' },
      { word: '何', reading: 'なん', meaning: '什么' },
      { word: 'お守り', reading: 'おまもり', meaning: '护身符' },
      { word: 'かわいい', reading: '', meaning: '可爱' },
      { word: 'それ', reading: '', meaning: '那个（靠近对方）' },
      { word: 'そうですか', reading: '', meaning: '这样啊' },
      { word: 'ですね', reading: '', meaning: '呢/表示感叹或确认' },
      { word: 'すみません', reading: '', meaning: '不好意思' },
    ],
    grammar:
      '「これは何ですか」询问事物；「それは～です」回答；「～ですね」表达感受/确认。',
    examTip:
      '注意「何」在句中常读「なん」。指示词题常考距离：これ（近我）/それ（近你）/あれ（远）。',
    quizzes: [
      {
        id: 'q1',
        prompt: '「これは何ですか」在问什么？',
        options: ['物品是什么', '多少钱', '在哪里', '什么时候'],
        correctIndex: 0,
      },
      {
        id: 'q2',
        prompt: '店员回答「それはお守りです」表示？',
        options: ['那是护身符', '这是护身符', '我想要护身符', '护身符在哪儿'],
        correctIndex: 0,
      },
      {
        id: 'q3',
        prompt: '「かわいいですね」更像哪种用法？',
        options: ['表达感想/夸赞', '表示拒绝', '提出请求', '说明理由'],
        correctIndex: 0,
      },
    ],
  },
  {
    id: 'how-much-is-it',
    title: '多少钱：いくらですか',
    level: 'N5',
    tags: ['购物', '价格'],
    scenario:
      '在商店询问价格并确认是否需要税。能把「数字」和「ですか」听清是关键。',
    dialogue: [
      { speaker: '你', ja: 'このドライヤーはいくらですか。', zh: '这个吹风机多少钱？' },
      { speaker: '店员', ja: '三千円です。税込みです。', zh: '3000日元。含税。' },
      { speaker: '你', ja: 'じゃあ、これをください。', zh: '那我要这个。' },
    ],
    vocabulary: [
      { word: 'いくら', reading: '', meaning: '多少钱' },
      { word: '円', reading: 'えん', meaning: '日元' },
      { word: '税込み', reading: 'ぜいこみ', meaning: '含税' },
      { word: 'ください', reading: '', meaning: '请给我/我要' },
      { word: 'この', reading: '', meaning: '这个（连体词）' },
      { word: 'です', reading: '', meaning: '是（礼貌断定）' },
      { word: 'じゃあ', reading: '', meaning: '那么/那就' },
      { word: 'これ', reading: '', meaning: '这个' },
    ],
    grammar:
      '「Aはいくらですか」询问价格；「～円です」回答；「これをください」购买表达。',
    examTip:
      '数字听力要抓关键词：千/百/十。遇到「税込み」或「別」要判断是否含税。',
    quizzes: [
      {
        id: 'q1',
        prompt: '「いくらですか」的意思是？',
        options: ['多少钱？', '要多少个？', '在哪儿？', '什么时候？'],
        correctIndex: 0,
      },
      {
        id: 'q2',
        prompt: '「三千円」是？',
        options: ['3000日元', '300日元', '30000日元', '3日元'],
        correctIndex: 0,
      },
      {
        id: 'q3',
        prompt: '「これをください」更接近？',
        options: ['我要这个', '我不要', '请等一下', '请便宜点'],
        correctIndex: 0,
      },
    ],
  },
  {
    id: 'dont-put-wasabi',
    title: '不要放芥末：入れないでください',
    level: 'N4',
    tags: ['餐厅', '请求'],
    scenario:
      '在餐厅点餐时提出“不要加某样东西”。句型「～ないでください」非常常用。',
    dialogue: [
      { speaker: '你', ja: 'すみません、わさびは入れないでください。', zh: '不好意思，请不要放芥末。' },
      { speaker: '店员', ja: 'はい、わかりました。', zh: '好的，明白。' },
      { speaker: '你', ja: 'ありがとうございます。', zh: '谢谢。' },
    ],
    vocabulary: [
      { word: '入れる', reading: 'いれる', meaning: '放入' },
      { word: '入れないでください', reading: 'いれないでください', meaning: '请不要放/不要加入' },
      { word: 'わさび', reading: '', meaning: '芥末' },
      { word: 'すみません', reading: '', meaning: '不好意思' },
      { word: 'はい', reading: '', meaning: '好的/是' },
      { word: 'ありがとう', reading: '', meaning: '谢谢（口语）' },
      { word: 'わかりました', reading: '', meaning: '明白了' },
    ],
    grammar:
      '「动词ない形＋でください」表示请求对方不要做某事。比命令更礼貌。',
    examTip:
      '「～ないでください」在听力里常和食物/过敏等一起出现。注意与「～なくてもいいです」的区别。',
    quizzes: [
      {
        id: 'q1',
        prompt: '「入れないでください」的意思是？',
        options: ['请不要放/不要加入', '请放进去', '请再放一次', '可以放吗'],
        correctIndex: 0,
      },
      {
        id: 'q2',
        prompt: '提出这种请求时更自然的开头是？',
        options: ['すみません', 'やめろ', '早く', '必ず'],
        correctIndex: 0,
      },
      {
        id: 'q3',
        prompt: '「ないでください」属于哪类表达？',
        options: ['礼貌请求（否定）', '过去时', '推量', '并列'],
        correctIndex: 0,
      },
    ],
  },
  {
    id: 'can-i-take-a-photo',
    title: '可以拍照吗：～てもいいですか',
    level: 'N4',
    tags: ['出行', '许可'],
    scenario:
      '在景点或商店询问是否允许拍照。用「～てもいいですか」礼貌询问许可。',
    dialogue: [
      { speaker: '你', ja: 'ここで写真を撮ってもいいですか。', zh: '我可以在这里拍照吗？' },
      { speaker: '工作人员', ja: 'はい、いいですよ。フラッシュはだめです。', zh: '可以的。但不能开闪光灯。' },
      { speaker: '你', ja: 'わかりました。', zh: '明白了。' },
    ],
    vocabulary: [
      { word: '写真', reading: 'しゃしん', meaning: '照片' },
      { word: '撮る', reading: 'とる', meaning: '拍（照）' },
      { word: 'フラッシュ', reading: '', meaning: '闪光灯' },
      { word: 'だめ', reading: '', meaning: '不行/禁止' },
      { word: 'ここ', reading: '', meaning: '这里' },
      { word: 'いいですよ', reading: '', meaning: '可以哦/没问题' },
      { word: '～てもいいですか', reading: '', meaning: '可以…吗（许可）' },
      { word: 'わかりました', reading: '', meaning: '明白了' },
    ],
    grammar:
      '「动词て形＋もいいですか」询问许可；「～はだめです」表示禁止事项。',
    examTip:
      '许可题常有陷阱：いいですよ（允许） vs だめです（禁止）。先听到规则再判断能不能做。',
    quizzes: [
      {
        id: 'q1',
        prompt: '「撮ってもいいですか」表示？',
        options: ['可以拍吗？', '拍了很好', '要拍几张', '正在拍'],
        correctIndex: 0,
      },
      {
        id: 'q2',
        prompt: '工作人员说「フラッシュはだめです」表示？',
        options: ['不能开闪光灯', '闪光灯很好', '请打开闪光灯', '闪光灯在哪里买'],
        correctIndex: 0,
      },
      {
        id: 'q3',
        prompt: '「～てもいいですか」属于？',
        options: ['询问许可', '说明原因', '表达愿望', '过去经历'],
        correctIndex: 0,
      },
    ],
  },
  {
    id: 'i-have-read-it',
    title: '读过：～たことがあります',
    level: 'N4',
    tags: ['表达', '经历'],
    scenario:
      '和朋友聊书或电影时，表达“曾经做过某事”的经历。常用「～たことがあります」。',
    dialogue: [
      { speaker: '朋友', ja: 'この本、読んだことがありますか。', zh: '这本书你读过吗？' },
      { speaker: '你', ja: 'はい、一度読んだことがあります。', zh: '读过一次。' },
      { speaker: '朋友', ja: 'どうでしたか。', zh: '觉得怎么样？' },
      { speaker: '你', ja: 'すごくおもしろかったです。', zh: '特别有意思。' },
    ],
    vocabulary: [
      { word: '読んだことがあります', reading: 'よんだことがあります', meaning: '读过（有过…经历）' },
      { word: '一度', reading: 'いちど', meaning: '一次/曾经' },
      { word: 'どうでしたか', reading: '', meaning: '怎么样？' },
      { word: 'おもしろい', reading: '', meaning: '有趣' },
      { word: 'この本', reading: 'このほん', meaning: '这本书' },
      { word: '読む', reading: 'よむ', meaning: '读' },
      { word: 'ありますか', reading: '', meaning: '有吗/…过吗' },
      { word: 'すごく', reading: '', meaning: '非常' },
    ],
    grammar:
      '「动词た形＋ことがあります」表示经历；「どうでしたか」询问感想；「～かったです」过去感想。',
    examTip:
      '「ことがあります」不要误听成“有某物”。它强调“经历过”。后面常跟次数：一度・二回。',
    quizzes: [
      {
        id: 'q1',
        prompt: '「読んだことがあります」表示？',
        options: ['读过（有过经历）', '正在读', '想读', '读完了（今天）'],
        correctIndex: 0,
      },
      {
        id: 'q2',
        prompt: '「一度」最贴近？',
        options: ['一次/曾经', '一直', '马上', '每天'],
        correctIndex: 0,
      },
      {
        id: 'q3',
        prompt: '「すごくおもしろかったです」表达的是？',
        options: ['过去的感想：很有意思', '未来计划', '请求帮助', '禁止事项'],
        correctIndex: 0,
      },
    ],
  },
  {
    id: 'library-books',
    title: '图书馆借书',
    level: 'N5',
    tags: ['校园', '说明'],
    scenario:
      '在图书馆咨询怎么借书、借多久。阅读与听力里经常出现说明性对话。',
    dialogue: [
      {
        speaker: '学生',
        ja: 'すみません、この本、何日まで借りられますか。',
        zh: '不好意思，这本书最多可以借多久？',
      },
      {
        speaker: '職員',
        ja: '二週間です。延長もできますよ。',
        zh: '两周。也可以续借哦。',
      },
      {
        speaker: '学生',
        ja: '返却はどこですか。',
        zh: '还书在哪里呢？',
      },
      {
        speaker: '職員',
        ja: '一階のカウンターです。こちらの紙にも書いてあります。',
        zh: '在一楼柜台。这张纸上也写着。',
      },
    ],
    vocabulary: [
      { word: '借りる', reading: 'かりる', meaning: '借入' },
      { word: '返却', reading: 'へんきゃく', meaning: '归还' },
      { word: '延長', reading: 'えんちょう', meaning: '延长、续借' },
      { word: '一階', reading: 'いっかい', meaning: '一楼' },
      { word: 'すみません', reading: '', meaning: '不好意思' },
      { word: '何日まで', reading: 'なんにちまで', meaning: '到哪一天为止（期限）' },
      { word: '二週間', reading: 'にしゅうかん', meaning: '两周' },
      { word: 'カウンター', reading: '', meaning: '柜台' },
    ],
    grammar:
      '「何日まで～られる」询问许可与期限；「～にも書いてある」表示信息已写明，阅读题里常作为细节出处。',
    examTip:
      '注意数字与时间：二週間、一階。听力里先听到问题再选「地点／期限」类答案，避免先入为主。',
    quizzes: [
      {
        id: 'q1',
        prompt: '根据对话，借书期限大约是？',
        options: ['两周', '一周', '一个月', '三天'],
        correctIndex: 0,
      },
      {
        id: 'q2',
        prompt: '「返却はどこですか」回答中提到的地点是？',
        options: ['一楼柜台', '二楼阅览室', '教室', '宿舍'],
        correctIndex: 0,
      },
      {
        id: 'q3',
        prompt: '「延長もできます」中的「延長」在借书场景里一般指？',
        options: ['续借', '赔偿', '预约', '复印'],
        correctIndex: 0,
      },
    ],
  },
  {
    id: 'absence-note',
    title: '写请假说明',
    level: 'N4',
    tags: ['应用文', '校园'],
    scenario:
      '因感冒想请假，需要写一句给老师的说明。应用文与作文里常考「理由＋请求」结构。',
    dialogue: [
      { speaker: '小田', ja: '先生、すみません。', zh: '老师，不好意思。' },
      { speaker: '小田', ja: '風邪のため、今日の授業を休ませてください。', zh: '因为感冒，请允许我缺席今天的课。' },
      { speaker: '小田', ja: '明日は元気になったら来ます。', zh: '如果明天好一些我会来。' },
    ],
    vocabulary: [
      { word: '風邪', reading: 'かぜ', meaning: '感冒' },
      { word: 'ため', reading: '', meaning: '因为…（名词／动词连体形＋ため）' },
      { word: '休む', reading: 'やすむ', meaning: '休息、缺席' },
      { word: '授業', reading: 'じゅぎょう', meaning: '上课、课程' },
      { word: '先生', reading: 'せんせい', meaning: '老师' },
      { word: '今日', reading: 'きょう', meaning: '今天' },
      { word: '休ませてください', reading: 'やすませてください', meaning: '请允许我请假/缺席' },
      { word: 'すみません', reading: '', meaning: '对不起/不好意思（用于请求）' },
    ],
    grammar:
      '「名词のため」表原因；「～させてください」请求允许，比「～てください」更正式，适合对老师。',
    examTip:
      '作文里写请假条：先写称呼，再写理由与请求，最后署名。避免口语缩略过度。',
    quizzes: [
      {
        id: 'q1',
        prompt: '「風邪のため」相当于中文的？',
        options: ['因为感冒', '为了感冒', '关于感冒', '除了感冒'],
        correctIndex: 0,
      },
      {
        id: 'q2',
        prompt: '「休ませてください」表达的是？',
        options: ['请求允许缺席／请假', '请老师休息', '要求停课', '提醒别人请假'],
        correctIndex: 0,
      },
      {
        id: 'q3',
        prompt: '这类便条写给「先生」时，语气最恰当的是？',
        options: ['使用「～させてください」等尊敬／请求表达', '只用简体朋友口吻', '不写理由只写名字', '用命令句要求老师'],
        correctIndex: 0,
      },
    ],
  },
  {
    id: 'morning-combini-breakfast',
    title: '便利店买早餐：これをください',
    level: 'N5',
    tags: ['购物', '早晨'],
    scenario:
      '早上上课前去便利店买饭团和饮料。先选商品，再询问是否需要加热，是日本生活里最常见的第一批对话。',
    dialogue: [
      { speaker: '店员', ja: 'いらっしゃいませ。', zh: '欢迎光临。' },
      { speaker: '你', ja: 'このおにぎりとお茶をください。', zh: '请给我这个饭团和茶。' },
      { speaker: '店员', ja: '温めますか。', zh: '需要加热吗？' },
      { speaker: '你', ja: 'いいえ、そのままでいいです。', zh: '不用，就这样可以。' },
    ],
    vocabulary: [
      { word: 'いらっしゃいませ', reading: '', meaning: '欢迎光临' },
      { word: 'おにぎり', reading: '', meaning: '饭团' },
      { word: 'お茶', reading: 'おちゃ', meaning: '茶' },
      { word: 'ください', reading: '', meaning: '请给我' },
      { word: '温める', reading: 'あたためる', meaning: '加热' },
      { word: 'そのまま', reading: '', meaning: '就那样/原样' },
      { word: 'いいです', reading: '', meaning: '可以/不用' },
      { word: 'この', reading: '', meaning: '这个' },
    ],
    grammar:
      '「AとBをください」用于点选商品；「そのままでいいです」表示保持原样即可。',
    examTip:
      '便利店听力常考“是否加热/是否需要袋子”。听到「温めますか」「袋は要りますか」要判断回答是要还是不要。',
    quizzes: [
      {
        id: 'q1',
        prompt: '「このおにぎりとお茶をください」表示？',
        options: ['请给我这个饭团和茶', '这个饭团很好吃', '请加热茶', '我不要饭团'],
        correctIndex: 0,
      },
      {
        id: 'q2',
        prompt: '店员说「温めますか」是在问什么？',
        options: ['要不要加热', '要不要袋子', '要不要找零', '要不要坐下'],
        correctIndex: 0,
      },
      {
        id: 'q3',
        prompt: '「そのままでいいです」最自然的意思是？',
        options: ['就这样可以', '请马上做', '我还要一个', '太热了'],
        correctIndex: 0,
      },
    ],
  },
  {
    id: 'train-transfer',
    title: '换乘电车：どこで乗り換えますか',
    level: 'N4',
    tags: ['出行', '电车'],
    scenario:
      '已经知道目的地后，继续确认在哪里换乘。这个场景自然接在“这班车去不去某地”之后。',
    dialogue: [
      { speaker: '你', ja: '池袋まで行きたいんですが、どこで乗り換えますか。', zh: '我想去池袋，请问在哪里换乘？' },
      { speaker: '駅员', ja: '新宿で山手線に乗り換えてください。', zh: '请在新宿换乘山手线。' },
      { speaker: '你', ja: '何番線ですか。', zh: '几号站台？' },
      { speaker: '駅员', ja: '二番線です。', zh: '二号站台。' },
    ],
    vocabulary: [
      { word: '池袋', reading: 'いけぶくろ', meaning: '池袋' },
      { word: '行きたい', reading: 'いきたい', meaning: '想去' },
      { word: '乗り換える', reading: 'のりかえる', meaning: '换乘' },
      { word: '新宿', reading: 'しんじゅく', meaning: '新宿' },
      { word: '山手線', reading: 'やまのてせん', meaning: '山手线' },
      { word: '何番線', reading: 'なんばんせん', meaning: '几号站台' },
      { word: '二番線', reading: 'にばんせん', meaning: '二号站台' },
      { word: 'ください', reading: '', meaning: '请' },
    ],
    grammar:
      '「～たいんですが」委婉说明目的；「場所で＋交通工具に乗り換える」表示在某地换乘到某条线路。',
    examTip:
      '电车题常考“站名＋线路名＋站台号”。先抓目的地，再听「で」「に」后面的换乘信息。',
    quizzes: [
      {
        id: 'q1',
        prompt: '对话中应该在哪里换乘？',
        options: ['新宿', '池袋', '二号站台', '便利店'],
        correctIndex: 0,
      },
      {
        id: 'q2',
        prompt: '「何番線ですか」是在问什么？',
        options: ['几号站台', '几点发车', '多少钱', '哪一站下车'],
        correctIndex: 0,
      },
      {
        id: 'q3',
        prompt: '「山手線に乗り換える」表示？',
        options: ['换乘山手线', '离开山手线', '买山手线票', '在山手线等人'],
        correctIndex: 0,
      },
    ],
  },
  {
    id: 'restaurant-order-lunch',
    title: '餐厅点午饭：おすすめは何ですか',
    level: 'N5',
    tags: ['餐厅', '点餐'],
    scenario:
      '中午到餐厅，不知道点什么，先问推荐，再点一份。比直接背菜单更贴近真实用餐流程。',
    dialogue: [
      { speaker: '店员', ja: 'いらっしゃいませ。何名様ですか。', zh: '欢迎光临。几位？' },
      { speaker: '你', ja: '一人です。おすすめは何ですか。', zh: '一位。推荐菜是什么？' },
      { speaker: '店员', ja: '今日の定食がおすすめです。', zh: '今天的套餐比较推荐。' },
      { speaker: '你', ja: 'じゃあ、それをお願いします。', zh: '那就麻烦给我那个。' },
    ],
    vocabulary: [
      { word: '何名様', reading: 'なんめいさま', meaning: '几位（敬语）' },
      { word: '一人', reading: 'ひとり', meaning: '一个人' },
      { word: 'おすすめ', reading: '', meaning: '推荐' },
      { word: '今日', reading: 'きょう', meaning: '今天' },
      { word: '定食', reading: 'ていしょく', meaning: '套餐' },
      { word: 'じゃあ', reading: '', meaning: '那么' },
      { word: 'それ', reading: '', meaning: '那个' },
      { word: 'お願いします', reading: 'おねがいします', meaning: '拜托/麻烦' },
    ],
    grammar:
      '「おすすめは何ですか」询问推荐；「それをお願いします」用于点刚才对方提到的东西。',
    examTip:
      '餐厅题常考人数、点餐内容、推荐菜。听到「おすすめ」后，后一句常是答案。',
    quizzes: [
      {
        id: 'q1',
        prompt: '「おすすめは何ですか」表示？',
        options: ['有什么推荐？', '多少钱？', '几点开门？', '在哪里？'],
        correctIndex: 0,
      },
      {
        id: 'q2',
        prompt: '店员推荐的是？',
        options: ['今天的套餐', '甜点', '茶', '外带盒'],
        correctIndex: 0,
      },
      {
        id: 'q3',
        prompt: '「それをお願いします」在点餐里表示？',
        options: ['麻烦给我那个', '请不要那个', '那个太贵了', '那个在哪里'],
        correctIndex: 0,
      },
    ],
  },
  {
    id: 'pay-by-card',
    title: '结账付款：カードで払えますか',
    level: 'N4',
    tags: ['购物', '付款'],
    scenario:
      '买完东西后确认能不能刷卡。付款方式是购物、餐厅、便利店都会反复出现的生活会话。',
    dialogue: [
      { speaker: '店员', ja: '全部で千二百円です。', zh: '一共一千二百日元。' },
      { speaker: '你', ja: 'カードで払えますか。', zh: '可以刷卡付款吗？' },
      { speaker: '店员', ja: 'はい、使えます。ここに入れてください。', zh: '可以。请插到这里。' },
      { speaker: '你', ja: 'ありがとうございます。', zh: '谢谢。' },
    ],
    vocabulary: [
      { word: '全部', reading: 'ぜんぶ', meaning: '全部/一共' },
      { word: '千二百円', reading: 'せんにひゃくえん', meaning: '一千二百日元' },
      { word: 'カード', reading: '', meaning: '卡' },
      { word: '払う', reading: 'はらう', meaning: '支付' },
      { word: '使える', reading: 'つかえる', meaning: '能使用' },
      { word: 'ここ', reading: '', meaning: '这里' },
      { word: '入れる', reading: 'いれる', meaning: '放入/插入' },
      { word: 'ください', reading: '', meaning: '请' },
    ],
    grammar:
      '「名词で払う」表示用某种方式付款；「～えます」表示可能形，“能不能”。',
    examTip:
      '金额题要留意「全部で」。付款题常出现「現金」「カード」「使えます」。',
    quizzes: [
      {
        id: 'q1',
        prompt: '这次一共多少钱？',
        options: ['1200日元', '200日元', '1000日元', '2200日元'],
        correctIndex: 0,
      },
      {
        id: 'q2',
        prompt: '「カードで払えますか」表示？',
        options: ['可以刷卡付款吗？', '可以办卡吗？', '卡在哪里？', '卡坏了吗？'],
        correctIndex: 0,
      },
      {
        id: 'q3',
        prompt: '「使えます」的意思是？',
        options: ['可以使用', '正在使用', '不能使用', '想使用'],
        correctIndex: 0,
      },
    ],
  },
  {
    id: 'meet-at-what-time',
    title: '约见时间：何時に会いますか',
    level: 'N5',
    tags: ['约定', '时间'],
    scenario:
      '和朋友约好一起去某个地方，需要确认时间和地点。它自然接在邀请之后。',
    dialogue: [
      { speaker: '你', ja: '明日、何時に会いますか。', zh: '明天几点见？' },
      { speaker: '友達', ja: '十時はどうですか。', zh: '十点怎么样？' },
      { speaker: '你', ja: 'いいですね。駅の前で会いましょう。', zh: '好呀。在车站前见吧。' },
      { speaker: '友達', ja: 'はい、また明日。', zh: '好，明天见。' },
    ],
    vocabulary: [
      { word: '明日', reading: 'あした', meaning: '明天' },
      { word: '何時', reading: 'なんじ', meaning: '几点' },
      { word: '会う', reading: 'あう', meaning: '见面' },
      { word: '十時', reading: 'じゅうじ', meaning: '十点' },
      { word: 'どうですか', reading: '', meaning: '怎么样' },
      { word: '駅の前', reading: 'えきのまえ', meaning: '车站前' },
      { word: '会いましょう', reading: 'あいましょう', meaning: '见面吧' },
      { word: 'また明日', reading: 'またあした', meaning: '明天见' },
    ],
    grammar:
      '「时间に会う」表示在某个时间见面；「地点で会う」表示在某地见面。',
    examTip:
      '约定题要同时抓时间和地点。听到「何時」「どこ」后，答案通常紧跟在后面。',
    quizzes: [
      {
        id: 'q1',
        prompt: '两个人约几点见？',
        options: ['十点', '明天', '车站前', '今天'],
        correctIndex: 0,
      },
      {
        id: 'q2',
        prompt: '他们约在哪里见？',
        options: ['车站前', '教室里', '餐厅里', '图书馆里'],
        correctIndex: 0,
      },
      {
        id: 'q3',
        prompt: '「また明日」表示？',
        options: ['明天见', '昨天见', '马上见', '不用见'],
        correctIndex: 0,
      },
    ],
  },
  {
    id: 'late-apology',
    title: '迟到道歉：遅れてすみません',
    level: 'N4',
    tags: ['约定', '道歉'],
    scenario:
      '约好见面后迟到了，需要说明原因并道歉。它紧接“约时间”之后，生活逻辑更顺。',
    dialogue: [
      { speaker: '你', ja: '遅れてすみません。電車が少し遅れました。', zh: '对不起我迟到了。电车稍微晚点了。' },
      { speaker: '友達', ja: '大丈夫です。今来たところです。', zh: '没关系。我也刚到。' },
      { speaker: '你', ja: '待ってくれてありがとう。', zh: '谢谢你等我。' },
      { speaker: '友達', ja: 'じゃあ、行きましょう。', zh: '那我们走吧。' },
    ],
    vocabulary: [
      { word: '遅れる', reading: 'おくれる', meaning: '迟到/晚点' },
      { word: 'すみません', reading: '', meaning: '对不起/不好意思' },
      { word: '電車', reading: 'でんしゃ', meaning: '电车' },
      { word: '少し', reading: 'すこし', meaning: '稍微' },
      { word: '大丈夫', reading: 'だいじょうぶ', meaning: '没关系/没事' },
      { word: '今', reading: 'いま', meaning: '现在' },
      { word: '来たところ', reading: 'きたところ', meaning: '刚到' },
      { word: '待ってくれる', reading: 'まってくれる', meaning: '为我等候' },
    ],
    grammar:
      '「～てすみません」表示为某事道歉；「今～たところ」表示刚刚做完某事。',
    examTip:
      '道歉场景要判断原因。听到「電車が遅れました」时，通常表示迟到原因是电车晚点。',
    quizzes: [
      {
        id: 'q1',
        prompt: '说话者为什么迟到？',
        options: ['电车晚点了', '睡过头了', '钱包丢了', '身体不舒服'],
        correctIndex: 0,
      },
      {
        id: 'q2',
        prompt: '「今来たところです」表示？',
        options: ['刚到', '还没来', '马上走', '已经回去了'],
        correctIndex: 0,
      },
      {
        id: 'q3',
        prompt: '「遅れてすみません」最自然的意思是？',
        options: ['迟到不好意思', '请不要迟到', '你迟到了', '我不会等'],
        correctIndex: 0,
      },
    ],
  },
  {
    id: 'weather-plan-change',
    title: '下雨改计划：雨が降りそうです',
    level: 'N4',
    tags: ['天气', '计划'],
    scenario:
      '出门前看到天色不好，和朋友商量把室外活动改到室内。它把天气、比较、提议自然串起来。',
    dialogue: [
      { speaker: '友達', ja: '空が暗いですね。', zh: '天空很暗呢。' },
      { speaker: '你', ja: '雨が降りそうです。外より中のほうがいいですね。', zh: '好像要下雨。比起外面，室内更好吧。' },
      { speaker: '友達', ja: 'じゃあ、カフェに行きましょう。', zh: '那去咖啡店吧。' },
      { speaker: '你', ja: 'はい、そうしましょう。', zh: '好，就这么办。' },
    ],
    vocabulary: [
      { word: '空', reading: 'そら', meaning: '天空' },
      { word: '暗い', reading: 'くらい', meaning: '暗的' },
      { word: '雨', reading: 'あめ', meaning: '雨' },
      { word: '降る', reading: 'ふる', meaning: '下（雨/雪）' },
      { word: '～そうです', reading: '', meaning: '看起来好像…' },
      { word: '外', reading: 'そと', meaning: '外面' },
      { word: '中', reading: 'なか', meaning: '里面' },
      { word: 'カフェ', reading: '', meaning: '咖啡店' },
    ],
    grammar:
      '「动词ます形去ます＋そうです」表示看起来要发生；「AよりBのほうが」表示比较。',
    examTip:
      '「そうです」有“听说”和“看起来”两种。这里因为看天空判断，所以是“看起来要下雨”。',
    quizzes: [
      {
        id: 'q1',
        prompt: '为什么想去室内？',
        options: ['好像要下雨', '太热了', '朋友迟到了', '店不开门'],
        correctIndex: 0,
      },
      {
        id: 'q2',
        prompt: '「雨が降りそうです」表示？',
        options: ['看起来要下雨', '听说下雨了', '已经下完雨', '不要下雨'],
        correctIndex: 0,
      },
      {
        id: 'q3',
        prompt: '最后两人决定去哪里？',
        options: ['咖啡店', '公园', '车站', '图书馆'],
        correctIndex: 0,
      },
    ],
  },
  {
    id: 'hotel-check-in',
    title: '酒店入住：予約しています',
    level: 'N4',
    tags: ['旅行', '酒店'],
    scenario:
      '旅行到酒店办理入住，先说明自己已经预约，再交出护照。旅行场景中非常实用。',
    dialogue: [
      { speaker: '你', ja: 'すみません、予約しています。小田です。', zh: '不好意思，我有预约。我是小田。' },
      { speaker: '前台', ja: 'はい、パスポートをお願いします。', zh: '好的，请出示护照。' },
      { speaker: '你', ja: 'はい、どうぞ。', zh: '好的，请。' },
      { speaker: '前台', ja: 'お部屋は三階です。', zh: '您的房间在三楼。' },
    ],
    vocabulary: [
      { word: '予約しています', reading: 'よやくしています', meaning: '已经预约了' },
      { word: 'パスポート', reading: '', meaning: '护照' },
      { word: 'お願いします', reading: 'おねがいします', meaning: '请/麻烦' },
      { word: 'どうぞ', reading: '', meaning: '请' },
      { word: '部屋', reading: 'へや', meaning: '房间' },
      { word: '三階', reading: 'さんがい', meaning: '三楼' },
      { word: '受付', reading: 'うけつけ', meaning: '接待处/前台' },
    ],
    grammar:
      '「予約しています」表示处于已经预约的状态；酒店前台常用「名词をお願いします」要求出示物品。',
    examTip:
      '酒店题常考姓名、房间楼层、证件。听到「お部屋は～です」后面通常是房间信息。',
    quizzes: [
      {
        id: 'q1',
        prompt: '说话者来酒店做什么？',
        options: ['办理已预约的入住', '退房', '找餐厅', '买车票'],
        correctIndex: 0,
      },
      {
        id: 'q2',
        prompt: '前台要求出示什么？',
        options: ['护照', '学生证', '车票', '雨伞'],
        correctIndex: 0,
      },
      {
        id: 'q3',
        prompt: '房间在几楼？',
        options: ['三楼', '一楼', '二楼', '五楼'],
        correctIndex: 0,
      },
    ],
  },
  {
    id: 'restaurant-waiting-list',
    title: '餐厅排队：名前を書いてください',
    level: 'N4',
    tags: ['餐厅', '排队'],
    scenario:
      '热门餐厅没有空位，需要写名字等叫号。这个场景自然补在餐厅点餐之前或之后。',
    dialogue: [
      { speaker: '你', ja: 'すみません、二人です。', zh: '不好意思，两位。' },
      { speaker: '店员', ja: '今、満席です。こちらに名前を書いてください。', zh: '现在满座。请在这里写名字。' },
      { speaker: '你', ja: 'どのくらい待ちますか。', zh: '要等多久？' },
      { speaker: '店员', ja: '十五分ぐらいです。', zh: '大约十五分钟。' },
    ],
    vocabulary: [
      { word: '二人', reading: 'ふたり', meaning: '两个人' },
      { word: '今', reading: 'いま', meaning: '现在' },
      { word: '満席', reading: 'まんせき', meaning: '满座' },
      { word: 'こちら', reading: '', meaning: '这里/这边' },
      { word: '名前', reading: 'なまえ', meaning: '名字' },
      { word: '書く', reading: 'かく', meaning: '写' },
      { word: '十五分', reading: 'じゅうごふん', meaning: '十五分钟' },
      { word: '待つ', reading: 'まつ', meaning: '等' },
    ],
    grammar:
      '「こちらに名词を書いてください」表示请把某物写在这里；「満席です」是餐厅常见固定说法。',
    examTip:
      '排队题常考等待时间和人数。「二人です」「十五分ぐらい」都是高频答案点。',
    quizzes: [
      {
        id: 'q1',
        prompt: '现在餐厅是什么状态？',
        options: ['满座', '关门', '很便宜', '没有菜单'],
        correctIndex: 0,
      },
      {
        id: 'q2',
        prompt: '店员让客人写什么？',
        options: ['名字', '地址', '电话号码', '作业'],
        correctIndex: 0,
      },
      {
        id: 'q3',
        prompt: '大概要等多久？',
        options: ['十五分钟', '五分钟', '五十分钟', '两小时'],
        correctIndex: 0,
      },
    ],
  },
  {
    id: 'exchange-size',
    title: '换尺码：サイズを交換できますか',
    level: 'N4',
    tags: ['购物', '售后'],
    scenario:
      '衣服买了以后发现尺码不合适，需要询问能否换号。这是比“想买”更真实的后续场景。',
    dialogue: [
      { speaker: '你', ja: 'すみません、この服は少し小さいです。', zh: '不好意思，这件衣服有点小。' },
      { speaker: '你', ja: 'サイズを交換できますか。', zh: '可以换尺码吗？' },
      { speaker: '店员', ja: 'レシートはありますか。', zh: '有小票吗？' },
      { speaker: '你', ja: 'はい、あります。', zh: '有。' },
    ],
    vocabulary: [
      { word: '服', reading: 'ふく', meaning: '衣服' },
      { word: '少し', reading: 'すこし', meaning: '稍微' },
      { word: '小さい', reading: 'ちいさい', meaning: '小的' },
      { word: 'サイズ', reading: '', meaning: '尺码' },
      { word: '交換', reading: 'こうかん', meaning: '交换/更换' },
      { word: 'できますか', reading: '', meaning: '可以吗' },
      { word: 'レシート', reading: '', meaning: '小票' },
      { word: 'あります', reading: '', meaning: '有' },
    ],
    grammar:
      '「名词を交換できますか」询问能否更换；「少し＋形容词」委婉表达不合适。',
    examTip:
      '售后题常考原因和条件：小了/大了、是否有小票。注意「レシート」这个外来语。',
    quizzes: [
      {
        id: 'q1',
        prompt: '客人想做什么？',
        options: ['换尺码', '买新鞋', '退餐', '拍照'],
        correctIndex: 0,
      },
      {
        id: 'q2',
        prompt: '为什么想换？',
        options: ['衣服有点小', '颜色太深', '价格太贵', '店关门了'],
        correctIndex: 0,
      },
      {
        id: 'q3',
        prompt: '店员问有没有什么？',
        options: ['小票', '护照', '雨伞', '车票'],
        correctIndex: 0,
      },
    ],
  },
  {
    id: 'pharmacy-cold-medicine',
    title: '药店买药：風邪薬はありますか',
    level: 'N4',
    tags: ['健康', '药店'],
    scenario:
      '感冒后去药店买药。它自然接在“嗓子痛”和“请假说明”之前，形成完整生活链条。',
    dialogue: [
      { speaker: '你', ja: 'すみません、風邪薬はありますか。', zh: '不好意思，有感冒药吗？' },
      { speaker: '店员', ja: 'はい。熱はありますか。', zh: '有。您发烧吗？' },
      { speaker: '你', ja: 'いいえ、のどが痛いです。', zh: '不，嗓子痛。' },
      { speaker: '店员', ja: 'では、この薬を一日三回飲んでください。', zh: '那么，请一天吃三次这个药。' },
    ],
    vocabulary: [
      { word: '風邪薬', reading: 'かぜぐすり', meaning: '感冒药' },
      { word: '熱', reading: 'ねつ', meaning: '发烧/热度' },
      { word: 'のど', reading: '', meaning: '嗓子' },
      { word: '痛い', reading: 'いたい', meaning: '疼' },
      { word: '薬', reading: 'くすり', meaning: '药' },
      { word: '一日三回', reading: 'いちにちさんかい', meaning: '一天三次' },
      { word: '飲む', reading: 'のむ', meaning: '喝/吃药' },
      { word: 'ください', reading: '', meaning: '请' },
    ],
    grammar:
      '「身体部位が痛いです」表示某处疼；「一日三回」是频率表达，药店/医院高频。',
    examTip:
      '健康题常考症状和用药频率。听到「一日三回」要能快速对应“一天三次”。',
    quizzes: [
      {
        id: 'q1',
        prompt: '客人主要哪里不舒服？',
        options: ['嗓子痛', '发烧', '肚子痛', '头晕'],
        correctIndex: 0,
      },
      {
        id: 'q2',
        prompt: '药要怎么吃？',
        options: ['一天三次', '一天一次', '饭前一次', '只喝水'],
        correctIndex: 0,
      },
      {
        id: 'q3',
        prompt: '「風邪薬」是什么意思？',
        options: ['感冒药', '止痛药', '眼药水', '胃药'],
        correctIndex: 0,
      },
    ],
  },
  {
    id: 'refuse-invitation',
    title: '委婉拒绝邀请：ちょっと用事があります',
    level: 'N4',
    tags: ['交际', '邀请'],
    scenario:
      '别人邀请你一起去，但你有事不能去。学会自然拒绝，比只会说“いいえ”更像真实生活。',
    dialogue: [
      { speaker: '友達', ja: '今夜、一緒に映画を見に行きませんか。', zh: '今晚要不要一起去看电影？' },
      { speaker: '你', ja: '行きたいんですが、ちょっと用事があります。', zh: '我想去，但是有点事。' },
      { speaker: '友達', ja: 'そうですか。じゃあ、また今度。', zh: '这样啊。那下次吧。' },
      { speaker: '你', ja: 'すみません。また誘ってください。', zh: '不好意思。下次再约我。' },
    ],
    vocabulary: [
      { word: '今夜', reading: 'こんや', meaning: '今晚' },
      { word: '一緒に', reading: 'いっしょに', meaning: '一起' },
      { word: '映画', reading: 'えいが', meaning: '电影' },
      { word: '見に行く', reading: 'みにいく', meaning: '去看' },
      { word: '行きたい', reading: 'いきたい', meaning: '想去' },
      { word: '用事', reading: 'ようじ', meaning: '事情/要办的事' },
      { word: 'また今度', reading: 'またこんど', meaning: '下次' },
      { word: '誘う', reading: 'さそう', meaning: '邀请' },
    ],
    grammar:
      '「～たいんですが、ちょっと…」是委婉拒绝常用结构：先表达意愿，再说明困难。',
    examTip:
      '听力里「行きたいんですが」后面常接转折，真实意思可能是不能去。不要只听前半句就选“接受”。',
    quizzes: [
      {
        id: 'q1',
        prompt: '说话者最后是否接受邀请？',
        options: ['没有，委婉拒绝了', '接受了', '已经看过电影', '不知道电影在哪里'],
        correctIndex: 0,
      },
      {
        id: 'q2',
        prompt: '拒绝的理由是什么？',
        options: ['有点事', '不喜欢电影', '身体不舒服', '没有钱'],
        correctIndex: 0,
      },
      {
        id: 'q3',
        prompt: '「また今度」表示？',
        options: ['下次吧', '现在马上', '昨天', '再也不'],
        correctIndex: 0,
      },
    ],
  },
  {
    id: 'borrow-pen-in-class',
    title: '上课借笔：ペンを貸してください',
    level: 'N5',
    tags: ['校园', '课堂'],
    scenario:
      '上课时忘记带笔，向旁边同学借一下。这个场景自然接在校园打招呼之后，属于最基础的课堂求助。',
    dialogue: [
      { speaker: '你', ja: 'すみません、ペンを貸してください。', zh: '不好意思，请借我一支笔。' },
      { speaker: '同学', ja: 'いいですよ。黒いペンでいいですか。', zh: '可以。黑色笔可以吗？' },
      { speaker: '你', ja: 'はい、大丈夫です。ありがとうございます。', zh: '可以，没问题。谢谢。' },
      { speaker: '同学', ja: 'どういたしまして。', zh: '不客气。' },
    ],
    vocabulary: [
      { word: 'ペン', reading: '', meaning: '笔' },
      { word: '貸す', reading: 'かす', meaning: '借出' },
      { word: '貸してください', reading: 'かしてください', meaning: '请借给我' },
      { word: '黒い', reading: 'くろい', meaning: '黑色的' },
      { word: '大丈夫', reading: 'だいじょうぶ', meaning: '没问题' },
      { word: 'ありがとうございます', reading: '', meaning: '谢谢' },
      { word: 'どういたしまして', reading: '', meaning: '不客气' },
      { word: 'すみません', reading: '', meaning: '不好意思' },
    ],
    grammar:
      '「名词を貸してください」表示请对方借给自己某物；「～でいいですか」确认某个选择是否可以。',
    examTip:
      '请求题常听到「貸してください」「見せてください」。注意「貸す」是借出，「借りる」是借入。',
    quizzes: [
      {
        id: 'q1',
        prompt: '说话者想借什么？',
        options: ['笔', '书', '伞', '手机'],
        correctIndex: 0,
      },
      {
        id: 'q2',
        prompt: '「黒いペンでいいですか」是在确认什么？',
        options: ['黑色笔是否可以', '笔多少钱', '笔在哪里', '笔是不是坏了'],
        correctIndex: 0,
      },
      {
        id: 'q3',
        prompt: '「貸してください」表示？',
        options: ['请借给我', '请买给我', '请还给我', '请写给我'],
        correctIndex: 0,
      },
    ],
  },
  {
    id: 'cafeteria-find-seat',
    title: '食堂找座位：ここに座ってもいいですか',
    level: 'N5',
    tags: ['校园', '食堂'],
    scenario:
      '中午食堂人很多，看到空位后礼貌询问能不能坐。它把学校生活和餐厅用语连接起来。',
    dialogue: [
      { speaker: '你', ja: 'すみません、ここに座ってもいいですか。', zh: '不好意思，我可以坐这里吗？' },
      { speaker: '学生', ja: 'はい、どうぞ。', zh: '可以，请坐。' },
      { speaker: '你', ja: 'ありがとうございます。今日は人が多いですね。', zh: '谢谢。今天人很多呢。' },
      { speaker: '学生', ja: 'そうですね。昼休みですから。', zh: '是啊，因为是午休时间。' },
    ],
    vocabulary: [
      { word: 'ここ', reading: '', meaning: '这里' },
      { word: '座る', reading: 'すわる', meaning: '坐' },
      { word: '座ってもいいですか', reading: 'すわってもいいですか', meaning: '可以坐吗' },
      { word: 'どうぞ', reading: '', meaning: '请' },
      { word: '人', reading: 'ひと', meaning: '人' },
      { word: '多い', reading: 'おおい', meaning: '多的' },
      { word: '昼休み', reading: 'ひるやすみ', meaning: '午休' },
      { word: '～から', reading: '', meaning: '因为…' },
    ],
    grammar:
      '「～てもいいですか」询问许可；「名词ですから」说明原因。',
    examTip:
      '许可题要区分「てもいいですか」（可以吗）和「てはいけません」（不可以）。',
    quizzes: [
      {
        id: 'q1',
        prompt: '「ここに座ってもいいですか」表示？',
        options: ['我可以坐这里吗？', '这里有人吗？', '这里很贵吗？', '请站起来'],
        correctIndex: 0,
      },
      {
        id: 'q2',
        prompt: '今天为什么人多？',
        options: ['因为是午休时间', '因为下雨', '因为考试', '因为车晚点'],
        correctIndex: 0,
      },
      {
        id: 'q3',
        prompt: '对方说「どうぞ」表示？',
        options: ['请', '不行', '等等', '再见'],
        correctIndex: 0,
      },
    ],
  },
  {
    id: 'laundry-machine-how-to-use',
    title: '洗衣机怎么用：洗濯機の使い方',
    level: 'N4',
    tags: ['居家', '操作'],
    scenario:
      '住进宿舍或公寓后第一次使用公共洗衣机，需要问别人怎么操作。它补上真实留学生活里很常见的生活节点。',
    dialogue: [
      { speaker: '你', ja: 'すみません、この洗濯機の使い方を教えてください。', zh: '不好意思，请教我这台洗衣机的用法。' },
      { speaker: '邻居', ja: 'まず、ここに洗剤を入れます。', zh: '首先，把洗衣液放到这里。' },
      { speaker: '邻居', ja: '次に、このボタンを押してください。', zh: '接着，请按这个按钮。' },
      { speaker: '你', ja: 'わかりました。ありがとうございます。', zh: '明白了。谢谢。' },
    ],
    vocabulary: [
      { word: '洗濯機', reading: 'せんたくき', meaning: '洗衣机' },
      { word: '使い方', reading: 'つかいかた', meaning: '用法' },
      { word: '教える', reading: 'おしえる', meaning: '教/告诉' },
      { word: 'まず', reading: '', meaning: '首先' },
      { word: '洗剤', reading: 'せんざい', meaning: '洗衣液/洗涤剂' },
      { word: '入れる', reading: 'いれる', meaning: '放入' },
      { word: '次に', reading: 'つぎに', meaning: '接着' },
      { word: 'ボタン', reading: '', meaning: '按钮' },
    ],
    grammar:
      '「名词の使い方」表示某物的用法；「まず/次に」用于说明步骤。',
    examTip:
      '流程题常用「まず、次に、それから」。听顺序词可以帮助判断步骤先后。',
    quizzes: [
      {
        id: 'q1',
        prompt: '说话者想知道什么？',
        options: ['洗衣机的用法', '洗衣机价格', '邻居名字', '洗衣时间'],
        correctIndex: 0,
      },
      {
        id: 'q2',
        prompt: '首先要放入什么？',
        options: ['洗涤剂', '钱包', '护照', '车票'],
        correctIndex: 0,
      },
      {
        id: 'q3',
        prompt: '「次に」表示？',
        options: ['接着/然后', '首先', '最后', '昨天'],
        correctIndex: 0,
      },
    ],
  },
  {
    id: 'garbage-sorting',
    title: '垃圾分类：これは燃えるごみですか',
    level: 'N4',
    tags: ['居家', '规则'],
    scenario:
      '在日本生活绕不开垃圾分类。这个对话把“物品是什么”和“规则怎么做”连在一起。',
    dialogue: [
      { speaker: '你', ja: 'すみません、これは燃えるごみですか。', zh: '不好意思，这个是可燃垃圾吗？' },
      { speaker: '邻居', ja: 'いいえ、プラスチックです。袋を分けてください。', zh: '不是，是塑料。请把袋子分开。' },
      { speaker: '你', ja: '何曜日に出しますか。', zh: '星期几丢？' },
      { speaker: '邻居', ja: '火曜日の朝です。', zh: '星期二早上。' },
    ],
    vocabulary: [
      { word: '燃えるごみ', reading: 'もえるごみ', meaning: '可燃垃圾' },
      { word: 'プラスチック', reading: '', meaning: '塑料' },
      { word: '袋', reading: 'ふくろ', meaning: '袋子' },
      { word: '分ける', reading: 'わける', meaning: '分开' },
      { word: '何曜日', reading: 'なんようび', meaning: '星期几' },
      { word: '出す', reading: 'だす', meaning: '拿出/丢出' },
      { word: '火曜日', reading: 'かようび', meaning: '星期二' },
      { word: '朝', reading: 'あさ', meaning: '早上' },
    ],
    grammar:
      '「これはAですか」确认分类；「袋を分けてください」表示请把袋子分开。',
    examTip:
      '规则题常考星期和时间。「火曜日の朝」这种组合要一起听。',
    quizzes: [
      {
        id: 'q1',
        prompt: '这个垃圾属于什么？',
        options: ['塑料', '可燃垃圾', '纸', '瓶子'],
        correctIndex: 0,
      },
      {
        id: 'q2',
        prompt: '什么时候丢？',
        options: ['星期二早上', '星期一晚上', '星期五下午', '每天都可以'],
        correctIndex: 0,
      },
      {
        id: 'q3',
        prompt: '「袋を分けてください」表示？',
        options: ['请把袋子分开', '请买袋子', '请扔掉袋子', '请洗袋子'],
        correctIndex: 0,
      },
    ],
  },
  {
    id: 'post-office-package',
    title: '邮局寄包裹：中国までお願いします',
    level: 'N4',
    tags: ['邮局', '旅行'],
    scenario:
      '给家人寄东西，需要在邮局说明目的地和寄送方式。这个场景比单纯背“邮局”更完整。',
    dialogue: [
      { speaker: '你', ja: 'すみません、この荷物を中国までお願いします。', zh: '不好意思，这个包裹请寄到中国。' },
      { speaker: '职员', ja: '航空便ですか、船便ですか。', zh: '航空件还是海运件？' },
      { speaker: '你', ja: '航空便でお願いします。いくらですか。', zh: '请用航空件。多少钱？' },
      { speaker: '职员', ja: '二千円です。', zh: '两千日元。' },
    ],
    vocabulary: [
      { word: '荷物', reading: 'にもつ', meaning: '包裹/行李' },
      { word: '中国', reading: 'ちゅうごく', meaning: '中国' },
      { word: 'まで', reading: '', meaning: '到…为止/到…' },
      { word: '航空便', reading: 'こうくうびん', meaning: '航空件' },
      { word: '船便', reading: 'ふなびん', meaning: '海运件' },
      { word: 'お願いします', reading: 'おねがいします', meaning: '麻烦/拜托' },
      { word: 'いくら', reading: '', meaning: '多少钱' },
      { word: '二千円', reading: 'にせんえん', meaning: '两千日元' },
    ],
    grammar:
      '「地点までお願いします」表示请送/寄到某地；「Aですか、Bですか」用于二选一确认。',
    examTip:
      '邮局题常考目的地、寄送方式、金额。注意「航空便」「船便」的区别。',
    quizzes: [
      {
        id: 'q1',
        prompt: '包裹要寄到哪里？',
        options: ['中国', '日本', '学校', '酒店'],
        correctIndex: 0,
      },
      {
        id: 'q2',
        prompt: '说话者选择了哪种寄送方式？',
        options: ['航空件', '海运件', '普通信', '快递到付'],
        correctIndex: 0,
      },
      {
        id: 'q3',
        prompt: '费用是多少？',
        options: ['两千日元', '二百日元', '一千日元', '三千日元'],
        correctIndex: 0,
      },
    ],
  },
  {
    id: 'delivery-redelivery',
    title: '快递再配送：明日の夜にお願いします',
    level: 'N4',
    tags: ['快递', '电话'],
    scenario:
      '不在家错过快递后，需要预约再配送时间。这个是日本生活里非常真实但教材常少讲的场景。',
    dialogue: [
      { speaker: '你', ja: 'すみません、不在票を見ました。再配達をお願いします。', zh: '不好意思，我看到了不在票。想预约再配送。' },
      { speaker: '客服', ja: 'いつがよろしいですか。', zh: '什么时候方便？' },
      { speaker: '你', ja: '明日の夜、七時から九時まででお願いします。', zh: '请安排明晚七点到九点。' },
      { speaker: '客服', ja: '承知しました。', zh: '明白了。' },
    ],
    vocabulary: [
      { word: '不在票', reading: 'ふざいひょう', meaning: '不在通知单' },
      { word: '見る', reading: 'みる', meaning: '看' },
      { word: '再配達', reading: 'さいはいたつ', meaning: '再配送' },
      { word: 'いつ', reading: '', meaning: '什么时候' },
      { word: 'よろしい', reading: '', meaning: '可以/方便（礼貌）' },
      { word: '明日', reading: 'あした', meaning: '明天' },
      { word: '夜', reading: 'よる', meaning: '晚上' },
      { word: '承知しました', reading: 'しょうちしました', meaning: '明白了/收到' },
    ],
    grammar:
      '「时间から时间まで」表示时间范围；「でお願いします」用于指定条件。',
    examTip:
      '电话题容易考时间段。「七時から九時まで」要听成一个完整范围。',
    quizzes: [
      {
        id: 'q1',
        prompt: '说话者想预约什么？',
        options: ['快递再配送', '酒店入住', '餐厅座位', '理发'],
        correctIndex: 0,
      },
      {
        id: 'q2',
        prompt: '预约的时间段是？',
        options: ['明晚七点到九点', '今晚七点到九点', '明早七点到九点', '明天下午两点'],
        correctIndex: 0,
      },
      {
        id: 'q3',
        prompt: '「承知しました」表示？',
        options: ['明白了/收到', '不知道', '请稍等', '不可以'],
        correctIndex: 0,
      },
    ],
  },
  {
    id: 'atm-withdraw-cash',
    title: 'ATM取钱：お金を下ろしたいです',
    level: 'N4',
    tags: ['银行', '生活'],
    scenario:
      '出门发现现金不够，需要在 ATM 取钱，向工作人员确认操作。它自然接在购物和付款之后。',
    dialogue: [
      { speaker: '你', ja: 'すみません、ATMでお金を下ろしたいです。', zh: '不好意思，我想在 ATM 取钱。' },
      { speaker: '工作人员', ja: 'このカードを入れて、暗証番号を押してください。', zh: '请插入这张卡，然后输入密码。' },
      { speaker: '你', ja: '手数料はかかりますか。', zh: '会收手续费吗？' },
      { speaker: '工作人员', ja: 'はい、百十円かかります。', zh: '会，收一百一十日元。' },
    ],
    vocabulary: [
      { word: 'ATM', reading: '', meaning: '自动取款机' },
      { word: 'お金', reading: 'おかね', meaning: '钱' },
      { word: '下ろす', reading: 'おろす', meaning: '取出/提款' },
      { word: 'カード', reading: '', meaning: '卡' },
      { word: '暗証番号', reading: 'あんしょうばんごう', meaning: '密码' },
      { word: '押す', reading: 'おす', meaning: '按' },
      { word: '手数料', reading: 'てすうりょう', meaning: '手续费' },
      { word: 'かかる', reading: '', meaning: '花费/需要' },
    ],
    grammar:
      '「～たいです」表达想做某事；「手数料がかかります」表示会产生手续费。',
    examTip:
      '服务窗口题常考金额和是否收费。听到「手数料」要进入费用判断。',
    quizzes: [
      {
        id: 'q1',
        prompt: '说话者想做什么？',
        options: ['取钱', '存包裹', '买饭团', '预约酒店'],
        correctIndex: 0,
      },
      {
        id: 'q2',
        prompt: '需要输入什么？',
        options: ['密码', '姓名', '房间号', '电话号码'],
        correctIndex: 0,
      },
      {
        id: 'q3',
        prompt: '手续费是多少？',
        options: ['110日元', '1000日元', '免费', '2000日元'],
        correctIndex: 0,
      },
    ],
  },
  {
    id: 'hair-salon-cut',
    title: '理发：少し短くしてください',
    level: 'N4',
    tags: ['生活', '理发'],
    scenario:
      '去理发店剪头发，需要说明想剪短一点，但不要太短。它训练非常实用的程度表达。',
    dialogue: [
      { speaker: '理发师', ja: '今日はどうしますか。', zh: '今天想怎么剪？' },
      { speaker: '你', ja: '少し短くしてください。でも、短すぎないでください。', zh: '请剪短一点。但是不要太短。' },
      { speaker: '理发师', ja: '前髪はどうしますか。', zh: '刘海怎么处理？' },
      { speaker: '你', ja: 'そのままで大丈夫です。', zh: '保持原样就可以。' },
    ],
    vocabulary: [
      { word: '今日', reading: 'きょう', meaning: '今天' },
      { word: '少し', reading: 'すこし', meaning: '稍微' },
      { word: '短い', reading: 'みじかい', meaning: '短的' },
      { word: '短くする', reading: 'みじかくする', meaning: '剪短/弄短' },
      { word: '短すぎる', reading: 'みじかすぎる', meaning: '太短' },
      { word: '前髪', reading: 'まえがみ', meaning: '刘海' },
      { word: 'そのまま', reading: '', meaning: '保持原样' },
      { word: '大丈夫', reading: 'だいじょうぶ', meaning: '没问题' },
    ],
    grammar:
      '「形容词くしてください」表示请把状态变成某样；「～すぎないでください」表示不要太过。',
    examTip:
      '程度表达常考「少し」「すぎる」。听到「でも」后面的限制条件也很关键。',
    quizzes: [
      {
        id: 'q1',
        prompt: '说话者想怎么剪？',
        options: ['稍微剪短一点', '染成红色', '全部剃掉', '完全不剪'],
        correctIndex: 0,
      },
      {
        id: 'q2',
        prompt: '「短すぎないでください」表示？',
        options: ['不要太短', '请更短', '太长了', '不用剪'],
        correctIndex: 0,
      },
      {
        id: 'q3',
        prompt: '刘海怎么处理？',
        options: ['保持原样', '剪很短', '染色', '烫卷'],
        correctIndex: 0,
      },
    ],
  },
  {
    id: 'clinic-reception',
    title: '医院挂号：保険証を持っていますか',
    level: 'N4',
    tags: ['健康', '医院'],
    scenario:
      '感冒或嗓子痛后去医院挂号，前台会问保险证和症状。它和药店买药、请假说明形成完整健康线。',
    dialogue: [
      { speaker: '前台', ja: '今日はどうしましたか。', zh: '今天怎么了？' },
      { speaker: '你', ja: '昨日から熱があります。', zh: '从昨天开始发烧。' },
      { speaker: '前台', ja: '保険証を持っていますか。', zh: '带保险证了吗？' },
      { speaker: '你', ja: 'はい、持っています。', zh: '带了。' },
    ],
    vocabulary: [
      { word: '今日', reading: 'きょう', meaning: '今天' },
      { word: 'どうしましたか', reading: '', meaning: '怎么了' },
      { word: '昨日', reading: 'きのう', meaning: '昨天' },
      { word: '熱', reading: 'ねつ', meaning: '发烧' },
      { word: 'ある', reading: '', meaning: '有' },
      { word: '保険証', reading: 'ほけんしょう', meaning: '保险证' },
      { word: '持つ', reading: 'もつ', meaning: '持有/带着' },
      { word: '持っています', reading: 'もっています', meaning: '带着/有' },
    ],
    grammar:
      '「时间から」表示从某时开始；「持っています」表示现在带着/拥有。',
    examTip:
      '医院题常考症状开始时间和证件。「昨日から」说明症状从昨天开始。',
    quizzes: [
      {
        id: 'q1',
        prompt: '说话者从什么时候开始发烧？',
        options: ['昨天', '今天早上', '上周', '明天'],
        correctIndex: 0,
      },
      {
        id: 'q2',
        prompt: '前台问有没有什么？',
        options: ['保险证', '护照', '学生证', '车票'],
        correctIndex: 0,
      },
      {
        id: 'q3',
        prompt: '「持っています」表示？',
        options: ['带着/有', '买了', '忘了', '丢了'],
        correctIndex: 0,
      },
    ],
  },
  {
    id: 'part-time-interview',
    title: '打工面试：週に何回入れますか',
    level: 'N3',
    tags: ['打工', '面试'],
    scenario:
      '生活稳定后想找兼职，面试时常被问每周能上几次班。这个场景把时间、能力和礼貌回答结合起来。',
    dialogue: [
      { speaker: '店长', ja: '週に何回入れますか。', zh: '一周能来几次班？' },
      { speaker: '你', ja: '平日は難しいですが、週末なら入れます。', zh: '平日比较难，但周末可以。' },
      { speaker: '店长', ja: '土曜日と日曜日の夜は大丈夫ですか。', zh: '周六和周日晚上可以吗？' },
      { speaker: '你', ja: 'はい、大丈夫です。よろしくお願いします。', zh: '可以。请多关照。' },
    ],
    vocabulary: [
      { word: '週', reading: 'しゅう', meaning: '周/星期' },
      { word: '何回', reading: 'なんかい', meaning: '几次' },
      { word: '入れます', reading: 'はいれます', meaning: '能排班/能上班' },
      { word: '平日', reading: 'へいじつ', meaning: '工作日/平日' },
      { word: '難しい', reading: 'むずかしい', meaning: '困难的' },
      { word: '週末', reading: 'しゅうまつ', meaning: '周末' },
      { word: '土曜日', reading: 'どようび', meaning: '星期六' },
      { word: '日曜日', reading: 'にちようび', meaning: '星期日' },
    ],
    grammar:
      '「Nなら」表示如果是某条件就可以；「週に何回」表示每周几次。',
    examTip:
      '面试/日程题常考可工作的日期和时间。注意「平日は難しいですが」后面才是真正可行的条件。',
    quizzes: [
      {
        id: 'q1',
        prompt: '说话者什么时候可以打工？',
        options: ['周末', '平日早上', '每天都可以', '完全不可以'],
        correctIndex: 0,
      },
      {
        id: 'q2',
        prompt: '「週に何回」表示？',
        options: ['每周几次', '一天几小时', '几个人', '几点开始'],
        correctIndex: 0,
      },
      {
        id: 'q3',
        prompt: '「平日は難しいですが」说明什么？',
        options: ['平日比较难', '平日最方便', '周末不行', '今天不行'],
        correctIndex: 0,
      },
    ],
  },
]

export const lessonLifeOrder = [
  'self-introduction',
  'where-are-you-from',
  'please-speak-slowly',
  'language-school-registration',
  'campus-greeting',
  'borrow-pen-in-class',
  'morning-combini-breakfast',
  'how-to-do-it',
  'cafeteria-find-seat',
  'what-is-this',
  'asking-directions',
  'which-train-to-ikebukuro',
  'train-transfer',
  'n4_wait_how_long',
  'restaurant-order-lunch',
  'restaurant-waiting-list',
  'dont-put-wasabi',
  'how-much-is-it',
  'pay-by-card',
  'atm-withdraw-cash',
  'i-want-gloves',
  'exchange-size',
  'hair-salon-cut',
  'do-you-have-omamori',
  'can-i-take-a-photo',
  'invite-photo',
  'invite-go-together',
  'meet-at-what-time',
  'late-apology',
  'library-books',
  'i-have-read-it',
  'n4_reason_because_first_time',
  'n4_compare_outside_better',
  'weather-plan-change',
  'what-time-is-the-bath',
  'hotel-check-in',
  'laundry-machine-how-to-use',
  'garbage-sorting',
  'post-office-package',
  'delivery-redelivery',
  'throat-hurts',
  'pharmacy-cold-medicine',
  'clinic-reception',
  'lost-wallet',
  'absence-note',
  'refuse-invitation',
  'n3_hearsay_concert',
  'n3_plan_intend_to_give',
  'part-time-interview',
  'n2_polite_request_check_japanese',
] as const

const lessonOrderIndex = new Map<string, number>(
  lessonLifeOrder.map((id, index) => [id, index]),
)
const lessonPoolIndex = new Map<string, number>(
  lessonPool.map((lesson, index) => [lesson.id, index]),
)

const lessonsWithStudentDialogues = lessonPool.map((lesson) => ({
  ...lesson,
  dialogue: studentDialogueOverrides[lesson.id] ?? lesson.dialogue,
}))

export const lessons: Lesson[] = [...lessonsWithStudentDialogues].sort((a, b) => {
  const byLifeOrder =
    (lessonOrderIndex.get(a.id) ?? Number.MAX_SAFE_INTEGER) -
    (lessonOrderIndex.get(b.id) ?? Number.MAX_SAFE_INTEGER)
  if (byLifeOrder !== 0) return byLifeOrder
  return (lessonPoolIndex.get(a.id) ?? 0) - (lessonPoolIndex.get(b.id) ?? 0)
})

export function getLesson(id: string) {
  return lessons.find((l) => l.id === id)
}
