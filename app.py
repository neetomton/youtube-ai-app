import streamlit as st
from googleapiclient.discovery import build
import google.generativeai as genai
from google.generativeai.types import HarmCategory, HarmBlockThreshold
import stripe

# ==========================================
# 👇 鍵の設定（本番環境のSecretsから読み込みます）
# ==========================================
try:
    YOUTUBE_API_KEY = st.secrets["YOUTUBE_API_KEY"]
    GEMINI_API_KEY = st.secrets["GEMINI_API_KEY"]
    STRIPE_API_KEY = st.secrets["STRIPE_API_KEY"]
    stripe.api_key = STRIPE_API_KEY
except:
    st.error("鍵の設定が見つかりません。Streamlit CloudのSecretsを設定してください。")

# 👇 本番公開後に、あなたのStreamlitアプリのURLに書き換えてください
# （デプロイ直後は自動で割り当てられる https://youtube-ai-app-xxxx.streamlit.app のようなURLになります）
YOUR_DOMAIN = "https://youtube-ai-app-erc7asvwqhbytnos9miwsm.streamlit.app" 

# ==========================================
# 🌐 多言語設定 / Language Settings
# ==========================================
languages = {
    "Japanese": "日本語",
    "English": "English",
    "Spanish": "Español",
    "Korean": "한국어",
    "Chinese": "中文"
}

ui_text = {
    "Japanese": {"title": "📺 YouTubeコメントAI解析くん ($1)", "input": "YouTubeのURLを入力してください", "buy_btn": "解析チケットを購入する ($1)", "success": "お支払いありがとうございます！解析を開始します。", "analyzing": "AIが全力で解析中...", "error_pay": "支払いが完了していません。", "error_comment": "コメントが取得できませんでした。", "top_btn": "トップに戻る", "info": "✅ 動画を認識しました！"},
    "English": {"title": "📺 YouTube AI Analyst ($1)", "input": "Enter YouTube URL", "buy_btn": "Buy Analysis Ticket ($1)", "success": "Payment successful! Starting analysis...", "analyzing": "AI is analyzing...", "error_pay": "Payment incomplete.", "error_comment": "No comments found.", "top_btn": "Back to Top", "info": "✅ Video detected!"},
    "Spanish": {"title": "📺 Analizador AI de YouTube ($1)", "input": "Introduce URL de YouTube", "buy_btn": "Comprar Ticket ($1)", "success": "¡Pago exitoso! Iniciando...", "analyzing": "AI analizando...", "error_pay": "Pago incompleto.", "error_comment": "Sin comentarios.", "top_btn": "Volver", "info": "✅ Video detectado!"},
    "Korean": {"title": "📺 유튜브 AI 분석기 ($1)", "input": "YouTube URL 입력", "buy_btn": "분석 티켓 구매 ($1)", "success": "결제 완료! 분석 시작...", "analyzing": "AI 분석 중...", "error_pay": "결제 미완료.", "error_comment": "댓글 없음.", "top_btn": "처음으로", "info": "✅ 동영상 인식됨!"},
    "Chinese": {"title": "📺 YouTube AI 分析器 ($1)", "input": "输入 YouTube 网址", "buy_btn": "购买分析券 ($1)", "success": "支付成功！开始分析...", "analyzing": "AI 分析中...", "error_pay": "支付未完成。", "error_comment": "未找到评论。", "top_btn": "返回首页", "info": "✅ 视频已识别！"}
}

# サイドバーで言語選択
st.sidebar.header("Language / 言語")
selected_lang_key = st.sidebar.selectbox("Select Language", list(languages.keys()))
target_language = languages[selected_lang_key]
current_ui = ui_text.get(selected_lang_key, ui_text["English"])

# ==========================================
# 🛠️ 関数定義
# ==========================================
def get_comments(video_id):
    try:
        youtube = build('youtube', 'v3', developerKey=YOUTUBE_API_KEY)
        response = youtube.commentThreads().list(
            part="snippet", videoId=video_id, maxResults=50, textFormat="plainText"
        ).execute()
        return [item['snippet']['topLevelComment']['snippet']['textDisplay'] for item in response['items']]
    except:
        return None

def analyze_comments(comments, lang_name):
    genai.configure(api_key=GEMINI_API_KEY)
    
    # ⚠️ Gemini 2.5は未リリースです。将来出たらここを 'gemini-2.5-flash' に変えてください。
    # 現在は最新の 1.5-flash を使用します。
    model = genai.GenerativeModel('gemini-2.5-flash')
    
    comments_text = "\n".join(comments)
    
    # プロンプトも言語に合わせて変化させます
    prompt = f"""
    You are a professional video analyst.
    Analyze the following YouTube comments and provide a summary report in **{lang_name}**.
    
    The report format must be as follows:
    1. Overall Rating (Score out of 5 and a short summary)
    2. Good Points (Bullet points)
    3. Bad/Concern Points (Bullet points)
    4. Next Video Suggestions for the YouTuber (3 ideas)
    
    [Comments Data]
    {comments_text}
    """
    
    safe = {HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_NONE, HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_NONE, HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_NONE, HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE}
    return model.generate_content(prompt, safety_settings=safe).text

# ==========================================
# 🖥️ メイン画面構築
# ==========================================
st.title(current_ui["title"])

# --- A. Stripeから戻ってきた時の処理 ---
query_params = st.query_params
if "session_id" in query_params:
    session_id = query_params["session_id"]
    try:
        session = stripe.checkout.Session.retrieve(session_id)
        if session.payment_status == 'paid':
            st.success(current_ui["success"])
            
            # メタデータから動画IDと「購入時の言語」を取り出す
            video_id = session.metadata.get("video_id")
            pay_lang = session.metadata.get("lang", "Japanese") # なければ日本語
            
            if video_id:
                with st.spinner(current_ui["analyzing"]):
                    comments = get_comments(video_id)
                    if comments:
                        # 記憶しておいた言語で解析！
                        result = analyze_comments(comments, pay_lang)
                        st.markdown(result)
                        st.balloons()
                    else:
                        st.error(current_ui["error_comment"])
            else:
                st.error("Video ID not found.")
        else:
            st.error(current_ui["error_pay"])
    except Exception as e:
        st.error(f"Error: {e}")
    
    if st.button(current_ui["top_btn"]):
        st.query_params.clear()

# --- B. 通常画面（URL入力） ---
else:
    url = st.text_input(current_ui["input"], placeholder="https://www.youtube.com/watch?v=...")
    
    if url and "v=" in url:
        video_id = url.split("v=")[1].split("&")[0]
        st.info(current_ui["info"])
        
        if st.button(current_ui["buy_btn"]):
            try:
                checkout_session = stripe.checkout.Session.create(
                    payment_method_types=['card'],
                    line_items=[{
                        'price_data': {
                            'currency': 'usd',
                            'product_data': {'name': 'YouTube Analysis Report'},
                            'unit_amount': 100, # $1.00
                        },
                        'quantity': 1,
                    }],
                    # 👇 ここで「動画ID」と「選択された言語」を記録しておく！
                    metadata={
                        'video_id': video_id,
                        'lang': target_language 
                    },
                    mode='payment',
                    success_url=YOUR_DOMAIN + "?session_id={CHECKOUT_SESSION_ID}",
                    cancel_url=YOUR_DOMAIN,
                )
                st.link_button("👉 Stripe Checkout", checkout_session.url)
            except Exception as e:
                st.error(f"Stripe Error: {e}")



