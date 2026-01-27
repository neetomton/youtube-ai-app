import streamlit as st
from googleapiclient.discovery import build
import google.generativeai as genai
from google.generativeai.types import HarmCategory, HarmBlockThreshold
# 👇 サーバーの「秘密の金庫」から鍵を取り出す設定に変えます
YOUTUBE_API_KEY = st.secrets["YOUTUBE_API_KEY"]
GEMINI_API_KEY = st.secrets["GEMINI_API_KEY"]
# ==========================================

# --- 準備 ---
try:
    genai.configure(api_key=GEMINI_API_KEY)
    youtube = build('youtube', 'v3', developerKey=YOUTUBE_API_KEY)
except Exception as e:
    st.error(f"Error: {e}")

# --- 言語設定（ここがポイント！） ---
languages = {
    "Japanese": "日本語",
    "English": "English",
    "Spanish": "Español",
    "Korean": "한국어",
    "Chinese": "中文"
}

# サイドバーで言語選択
st.sidebar.header("Settings / 設定")
selected_lang_key = st.sidebar.selectbox("Language / 言語", list(languages.keys()))
target_language = languages[selected_lang_key]

# UIの文字も言語に合わせて変える辞書
ui_text = {
    "Japanese": {"title": "📺 YouTubeコメントAI解析くん", "input": "YouTubeのURLを入力してください", "button": "解析する", "loading": "AIが分析中..."},
    "English": {"title": "📺 YouTube AI Comment Analyzer", "input": "Enter YouTube URL", "button": "Analyze ", "loading": "AI is analyzing..."},
    "Spanish": {"title": "📺 Analizador de YouTube AI", "input": "Introduce la URL de YouTube", "button": "Analizar", "loading": "Analizando..."},
    "Korean": {"title": "📺 유튜브 댓글 AI 분석기", "input": "YouTube URL을 입력하세요", "button": "분석하기", "loading": "분석 중..."},
    "Chinese": {"title": "📺 YouTube 评论 AI 分析器", "input": "请输入 YouTube 网址", "button": "分析", "loading": "分析中..."}
}
# 選ばれた言語のテキストを取得（なければ英語）
current_ui = ui_text.get(selected_lang_key, ui_text["English"])

# --- 関数: YouTubeからコメントを取得 ---
def get_comments(video_id):
    try:
        response = youtube.commentThreads().list(
            part="snippet",
            videoId=video_id,
            maxResults=50, 
            textFormat="plainText"
        ).execute()
        comments = [item['snippet']['topLevelComment']['snippet']['textDisplay'] for item in response['items']]
        return comments
    except Exception as e:
        return None

# --- 画面表示 ---
st.title(current_ui["title"])

# URL入力欄
url = st.text_input(current_ui["input"])

if st.button(current_ui["button"]):
    if url and "v=" in url:
        video_id = url.split("v=")[1].split("&")[0]
        
        with st.spinner(current_ui["loading"]):
            comments = get_comments(video_id)
            
            if comments:
                comments_text = "\n".join(comments)
                
                # プロンプト（AIへの命令文）を多言語対応に！
                prompt = f"""
                You are a professional video analyst.
                Analyze the following YouTube comments and provide a summary report in **{target_language}**.
                
                The report format must be as follows:
                1. Overall Rating (Score out of 5 and a short summary)
                2. Good Points (Bullet points)
                3. Bad/Concern Points (Bullet points)
                4. Next Video Suggestions for the YouTuber (3 ideas)
                
                [Comments Data]
                {comments_text}
                """
                
                try:
                    model = genai.GenerativeModel('gemini-2.5-flash')
                    # 安全フィルター解除
                    safe = {
                        HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_NONE,
                        HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_NONE,
                        HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_NONE,
                        HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE,
                    }
                    response = model.generate_content(prompt, safety_settings=safe)
                    
                    st.success("Completed!")
                    st.markdown(response.text)
                    
                except Exception as e:
                    st.error(f"AI Error: {e}")
            else:
                st.error("No comments found.")
    else:

        st.error("Please enter a valid YouTube URL.")
