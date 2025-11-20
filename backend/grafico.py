from flask import Flask, jsonify
import requests
from datetime import datetime
import pytz
import numpy as np
import plotly.graph_objs as go
from plotly.offline import plot as plot_offline

# ===================== CONFIGURAÇÃO =====================

# >>> ATENÇÃO: troque pelo IP da sua VM FIWARE <<<
IP_ADDRESS = "102.37.18.193"  # ex: "20.163.23.245"
PORT_STH = 8666

ENTITY_ID = "urn:ngsi-ld:Bracelet:001"
ENTITY_TYPE = "Bracelet"
ATTRIBUTE = "accelMag"

LAST_N_RECORDS = 100

FIWARE_SERVICE = "smart"
FIWARE_SERVICEPATH = "/"

# Meta de atividade saudável (em g)
TARGET_ACCEL_MAG = 0.70

app = Flask(__name__)


# ===================== CORS SIMPLES =====================

@app.after_request
def add_cors_headers(response):
    # Permite que o frontend (outra porta) acesse / e /stats
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    response.headers["Access-Control-Allow-Methods"] = "GET, OPTIONS"
    return response


# ===================== FUNÇÕES AUXILIARES =====================

def get_historical(lastN: int):
    """Busca histórico no STH-Comet para o atributo accelMag."""
    url = (
        f"http://{IP_ADDRESS}:{PORT_STH}/STH/v1/contextEntities/"
        f"type/{ENTITY_TYPE}/id/{ENTITY_ID}/attributes/{ATTRIBUTE}?lastN={lastN}"
    )
    headers = {
        "fiware-service": FIWARE_SERVICE,
        "fiware-servicepath": FIWARE_SERVICEPATH,
    }
    try:
        resp = requests.get(url, headers=headers, timeout=20)
        resp.raise_for_status()
        data = resp.json()
        values = data["contextResponses"][0]["contextElement"]["attributes"][0]["values"]
        return values
    except Exception as e:
        print("Erro ao buscar dados do STH-Comet:", e)
        return []


def convert_ts(timestamps):
    """Converte timestamps UTC para horário de São Paulo."""
    utc = pytz.utc
    sp = pytz.timezone("America/Sao_Paulo")
    out = []
    for t in timestamps:
        try:
            clean = t.replace("T", " ").replace("Z", "")
            try:
                dt = datetime.strptime(clean, "%Y-%m-%d %H:%M:%S.%f")
            except ValueError:
                dt = datetime.strptime(clean, "%Y-%m-%d %H:%M:%S")
            out.append(utc.localize(dt).astimezone(sp))
        except Exception as e:
            print("Erro convertendo timestamp:", e)
    return out


# ===================== ROTA HTML (GRÁFICO) =====================

@app.route("/")
def grafico_atividade():
    data = get_historical(LAST_N_RECORDS)
    if not data:
        html = """
        <html>
          <head>
            <meta charset="utf-8" />
            <title>Gráfico de Atividade</title>
          </head>
          <body style="margin:0;padding:16px;background-color:#0f172a;color:#e5e7eb;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
            <p>Não foi possível carregar dados de <code>accelMag</code>. Verifique se o STH-Comet está recebendo notificações.</p>
          </body>
        </html>
        """
        return html

    accel_vals = [float(d["attrValue"]) for d in data]
    times = convert_ts([d["recvTime"] for d in data])
    user_mean = float(np.mean(accel_vals))

    neonlime = "#a3e635"
    slate400 = "#94a3b8"
    slate300 = "#cbd5e1"
    slate100 = "#f1f5f9"

    trace_accel = go.Scatter(
        x=times,
        y=accel_vals,
        mode="lines+markers",
        name="Intensidade (accelMag)",
        line=dict(color=neonlime, width=3),
        marker=dict(size=5, color=neonlime),
        hovertemplate="Intensidade: %{y:.2f} g<br>%{x}<extra></extra>",
    )

    trace_mean = go.Scatter(
        x=times,
        y=[user_mean] * len(times),
        mode="lines",
        name=f"Média do usuário ({user_mean:.2f} g)",
        line=dict(color=slate400, width=2, dash="dash"),
        hovertemplate="Média: %{y:.2f} g<br>%{x}<extra></extra>",
    )

    trace_target = go.Scatter(
        x=times,
        y=[TARGET_ACCEL_MAG] * len(times),
        mode="lines",
        name=f"Meta saudável ({TARGET_ACCEL_MAG:.2f} g)",
        line=dict(color=slate300, width=2, dash="dot"),
        hovertemplate="Meta: %{y:.2f} g<br>%{x}<extra></extra>",
    )

    # Layout compacto para caber inteiro no iframe, sem scroll interno
    layout = go.Layout(
        title=dict(
            font=dict(
                family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                size=16,
                color=slate100,
            ),
        ),
        height=280,  # altura reduzida
        margin=dict(l=40, r=20, t=40, b=40),
        plot_bgcolor="rgba(15,23,42,1)",
        paper_bgcolor="rgba(15,23,42,1)",
        hovermode="x unified",
        xaxis=dict(
            title=dict(
                text="Horário (São Paulo)",
                font=dict(size=11, family="system-ui"),
            ),
            gridcolor="rgba(148,163,184,0.4)",
            linecolor=slate300,
            color=slate100,
            tickfont=dict(size=10, family="system-ui"),
        ),
        yaxis=dict(
            title=dict(
                text="Intensidade (g)",
                font=dict(size=11, family="system-ui"),
            ),
            gridcolor="rgba(148,163,184,0.4)",
            linecolor=slate300,
            color=slate100,
            tickfont=dict(size=10, family="system-ui"),
        ),
        legend=dict(
            bgcolor="rgba(15,23,42,1)",
            orientation="h",
            yanchor="bottom",
            y=1.02,
            xanchor="center",
            x=0.5,
            font=dict(
                family="system-ui",
                size=10,
                color=slate100,
            ),
        ),
    )

    fig = go.Figure(data=[trace_accel, trace_mean, trace_target], layout=layout)
    div = plot_offline(fig, include_plotlyjs="cdn", output_type="div")

    # HTML minimalista: só o gráfico, sem título/descrição extra
    html = f"""
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Gráfico de Atividade</title>
        <style>
          body {{
            margin: 0;
            padding: 0;
            background-color: #0f172a;
            color: #e5e7eb;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          }}
        </style>
      </head>
      <body>
        {div}
      </body>
    </html>
    """
    return html


# ===================== ROTA JSON (ESTATÍSTICAS) =====================

@app.route("/stats")
def stats():
    data = get_historical(LAST_N_RECORDS)
    if not data:
        return jsonify({
            "mean": None,
            "count": 0,
            "target": TARGET_ACCEL_MAG
        })

    accel_vals = [float(d["attrValue"]) for d in data]
    user_mean = float(np.mean(accel_vals))

    return jsonify({
        "mean": user_mean,
        "count": len(accel_vals),
        "target": TARGET_ACCEL_MAG
    })


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=False)
