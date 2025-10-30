import { useState } from 'react';
import { BarChart, Bar, LineChart, Line, Area, AreaChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useData } from '../context/DataContext';
import Filtros from '../components/Filtros';

const Dashboard = () => {
  const { loading, error, getMetrics, getCheckInsPorAtivacao, getCheckInsPorDia, getPicosPorHorario, getFunnelData, filters, updateFilters } = useData();
  const [ativacaoSelecionada, setAtivacaoSelecionada] = useState(null);
  const [dataSelecionadaPicos, setDataSelecionadaPicos] = useState(null);

  // Obter métricas do contexto
  const metrics = getMetrics();

  // Obter dados do gráfico de ativações (Top 10)
  const chartData = getCheckInsPorAtivacao().slice(0, 10);

  // Obter dados do gráfico de check-ins por dia
  const chartDataPorDia = getCheckInsPorDia();

  // Obter dados de picos por horário
  const { chartData: chartDataPicos, datasDisponiveis: datasDisponiveisPicos } = getPicosPorHorario(dataSelecionadaPicos);

  // Obter dados do funil de conversão
  const funnelData = getFunnelData();

  // Handler para clicar na barra
  const handleBarClick = (data) => {
    if (ativacaoSelecionada === data.id) {
      // Se clicar na mesma ativação, desseleciona
      setAtivacaoSelecionada(null);
      const newFilters = { ...filters };
      delete newFilters.ativacaoSelecionada;
      updateFilters(newFilters);
    } else {
      // Seleciona nova ativação
      setAtivacaoSelecionada(data.id);
      updateFilters({
        ...filters,
        ativacaoSelecionada: data.id
      });
    }
  };

  // Tooltip customizado para gráfico de ativações
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="card shadow-sm" style={{ padding: '10px', border: '1px solid #ccc' }}>
          <p className="mb-1" style={{ fontWeight: 'bold' }}>{data.nome}</p>
          <p className="mb-1" style={{ color: '#0d6efd' }}>
            Check-ins: <strong>{data.checkins}</strong>
          </p>
          <p className="mb-0" style={{ color: '#ffc107' }}>
            Média Avaliação: <strong>{data.mediaAvaliacao.toFixed(2)}</strong> ⭐
          </p>
        </div>
      );
    }
    return null;
  };

  // Tooltip customizado para gráfico por dia
  const CustomTooltipPorDia = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="card shadow-sm" style={{ padding: '10px', border: '1px solid #ccc' }}>
          <p className="mb-1" style={{ fontWeight: 'bold' }}>{data.dataFormatada}</p>
          <p className="mb-1" style={{ color: '#198754' }}>
            Check-ins: <strong>{data.checkins}</strong>
          </p>
          <p className="mb-0" style={{ color: '#ffc107' }}>
            Média Avaliação: <strong>{data.mediaAvaliacao > 0 ? data.mediaAvaliacao.toFixed(2) : 'Sem avaliações'}</strong> {data.mediaAvaliacao > 0 && '⭐'}
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Erro ao carregar dados</h4>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="row mb-4">
        <div className="col">
          <h1 className="display-4">Dashboard Rec-n-Play</h1>
          <p className="lead text-muted">Visão geral das métricas do evento</p>
        </div>
      </div>

      {/* Componente de Filtros */}
      <Filtros />

      {/* Alerta de Ativação Selecionada */}
      {ativacaoSelecionada && (
        <div className="alert alert-warning alert-dismissible fade show" role="alert">
          <strong>Filtro Ativo:</strong> Mostrando dados apenas dos usuários da ativação selecionada.
          <button
            type="button"
            className="btn-close"
            onClick={() => {
              setAtivacaoSelecionada(null);
              const newFilters = { ...filters };
              delete newFilters.ativacaoSelecionada;
              updateFilters(newFilters);
            }}
          ></button>
        </div>
      )}

      {/* Cards de Métricas */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-subtitle mb-2 text-muted">Total de Usuários</h6>
                  <h6 className="card-subtitle mb-2 text-muted">com Ativações</h6>
                  <h2 className="card-title mb-0 mt-2" style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#0d6efd' }}>
                    {metrics.totalUsuariosComAtivacoes}
                  </h2>
                </div>
                <div className="bg-primary bg-opacity-10 rounded-circle p-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="#0d6efd" className="bi bi-people-fill" viewBox="0 0 16 16">
                    <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1H7Zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-5.784 6A2.238 2.238 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.325 6.325 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1h4.216ZM4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-subtitle mb-2 text-muted">Total de Check-ins</h6>
                  <h2 className="card-title mb-0 mt-2" style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#198754' }}>
                    {metrics.totalCheckins}
                  </h2>
                </div>
                <div className="bg-success bg-opacity-10 rounded-circle p-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="#198754" className="bi bi-check-circle-fill" viewBox="0 0 16 16">
                    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-subtitle mb-2 text-muted">Total de Resgates</h6>
                  <h2 className="card-title mb-0 mt-2" style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#dc3545' }}>
                    {metrics.totalResgates}
                  </h2>
                </div>
                <div className="bg-danger bg-opacity-10 rounded-circle p-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="#dc3545" className="bi bi-gift-fill" viewBox="0 0 16 16">
                    <path d="M3 2.5a2.5 2.5 0 0 1 5 0 2.5 2.5 0 0 1 5 0v.006c0 .07 0 .27-.038.494H15a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h2.038A2.968 2.968 0 0 1 3 2.506V2.5zm1.068.5H7v-.5a1.5 1.5 0 1 0-3 0c0 .085.002.274.045.43a.522.522 0 0 0 .023.07zM9 3h2.932a.56.56 0 0 0 .023-.07c.043-.156.045-.345.045-.43a1.5 1.5 0 0 0-3 0V3zM1 4v.5h3.5V4H1zm5.5 0v.5h3V4h-3zm4.5 0v.5H15V4h-4zM0 5.5V14a1 1 0 0 0 1 1h6V5.5H0zm8 0V15h6a1 1 0 0 0 1-1V5.5H8z"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-subtitle mb-2 text-muted">Média Geral</h6>
                  <h6 className="card-subtitle mb-2 text-muted">de Avaliações</h6>
                  <h2 className="card-title mb-0 mt-2" style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#ffc107' }}>
                    {metrics.mediaGeralAvaliacoes.toFixed(2)}
                  </h2>
                  <small className="text-muted">de 5.00 ⭐</small>
                </div>
                <div className="bg-warning bg-opacity-10 rounded-circle p-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="#ffc107" className="bi bi-star-fill" viewBox="0 0 16 16">
                    <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Linha com 2 gráficos */}
      <div className="row mb-4">
        {/* Gráfico de Check-ins por Dia */}
        <div className="col-md-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title mb-2">Check-ins por Dia</h5>
              <p className="text-muted small mb-4">
                Visualize a distribuição de check-ins ao longo dos dias
              </p>
              {chartDataPorDia.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={chartDataPorDia}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="dataFormatada"
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis />
                    <Tooltip content={<CustomTooltipPorDia />} />
                    <Legend />
                    <Bar
                      dataKey="checkins"
                      fill="#198754"
                      name="Check-ins"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-5">
                  <p className="text-muted">Nenhum dado disponível para exibir</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Gráfico de Picos de Horário */}
        <div className="col-md-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h5 className="card-title mb-2">Picos de Horário de Check-ins</h5>
                  <p className="text-muted small mb-0">
                    Horários com maior número de check-ins
                  </p>
                </div>
                <div style={{ minWidth: '150px' }}>
                  <select
                    className="form-select form-select-sm"
                    value={dataSelecionadaPicos || ''}
                    onChange={(e) => setDataSelecionadaPicos(e.target.value || null)}
                  >
                    <option value="">Todas as datas</option>
                    {datasDisponiveisPicos.map((data) => (
                      <option key={data.valor} value={data.valor}>
                        {data.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {chartDataPicos.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart
                    data={chartDataPicos}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <defs>
                      <linearGradient id="colorCriacoes" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6f42c1" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#6f42c1" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="horaFormatada"
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
                      labelStyle={{ fontWeight: 'bold' }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="check-ins"
                      stroke="#6f42c1"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorCriacoes)"
                      name="Check-ins"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-5">
                  <p className="text-muted">Nenhum dado disponível para exibir</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Linha com Funil e Check-ins por Ativação */}
      <div className="row mb-4">
        {/* Gráfico de Funil de Atividades */}
        <div className="col-md-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title mb-2">Visão Geral de Atividades</h5>
              <p className="text-muted small mb-4">
                Total de registros por tipo de atividade
              </p>
              {funnelData.length > 0 ? (
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                  <div style={{ width: '100%', maxWidth: '500px' }}>
                    {funnelData.map((item, index) => {
                      const widthPercent = item.percentual;
                      const minWidth = 40; // Largura mínima em percentual para visibilidade
                      const adjustedWidth = Math.max(minWidth, widthPercent);

                      return (
                        <div
                          key={index}
                          className="mb-2"
                          style={{
                            width: '100%',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            position: 'relative'
                          }}
                        >
                          <div
                            style={{
                              width: `${adjustedWidth}%`,
                              backgroundColor: item.cor,
                              color: 'white',
                              padding: '18px 20px',
                              borderRadius: '10px',
                              textAlign: 'center',
                              fontSize: '14px',
                              fontWeight: '600',
                              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                              transition: 'all 0.3s ease',
                              cursor: 'default',
                              position: 'relative',
                              overflow: 'hidden'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'translateY(-3px)';
                              e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.15)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                            }}
                          >
                            <div style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
                              pointerEvents: 'none'
                            }}></div>
                            <div style={{ position: 'relative', zIndex: 1 }}>
                              <div style={{ fontSize: '13px', marginBottom: '8px', opacity: 0.95 }}>
                                {item.etapa}
                              </div>
                              <div style={{ fontSize: '28px', fontWeight: 'bold', letterSpacing: '1px' }}>
                                {item.quantidade.toLocaleString('pt-BR')}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-5">
                  <p className="text-muted">Nenhum dado disponível para exibir</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Gráfico de Check-ins por Ativação */}
        <div className="col-md-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title mb-2">Check-ins por Ativação (Top 10)</h5>
              <p className="text-muted small mb-4">
                Clique em uma barra para filtrar os dados por ativação
              </p>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart
                    data={chartData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 150, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis
                      type="category"
                      dataKey="nome"
                      width={140}
                      style={{ fontSize: '12px' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar
                      dataKey="checkins"
                      name="Check-ins"
                      radius={[0, 8, 8, 0]}
                      onClick={handleBarClick}
                      cursor="pointer"
                    >
                      {chartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={ativacaoSelecionada === null || ativacaoSelecionada === entry.id ? '#0d6efd' : '#c0c0c0'}
                          opacity={ativacaoSelecionada === null || ativacaoSelecionada === entry.id ? 1 : 0.3}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-5">
                  <p className="text-muted">Nenhum dado disponível para exibir</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
