import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Crown, ArrowLeft } from "lucide-react";

export default function CreatorTerms() {
  return (
    <Layout>
      <div className="min-h-screen py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="mb-12">
            <Button
              variant="ghost"
              className="mb-6 text-xnema-orange hover:text-xnema-orange/80"
              asChild
            >
              <Link to="/creators">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar para Criadores
              </Link>
            </Button>
            
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-xnema-orange to-xnema-purple rounded-full flex items-center justify-center">
                <Crown className="w-6 h-6 text-black" />
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-foreground">
                Termos de Uso para Criadores – Cinexnema
              </h1>
            </div>
            
            <p className="text-lg text-muted-foreground">
              Última atualização: {new Date().toLocaleDateString('pt-BR')}
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-invert max-w-none">
            <div className="bg-gradient-to-r from-xnema-orange/20 to-xnema-purple/20 border border-xnema-orange/30 rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">🎉 Período de Carência Especial</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                <span className="text-xnema-orange font-bold">3 meses gratuitos para novos criadores!</span><br/>
                Comece a gerar renda imediatamente, sem mensalidade ou taxas sobre a receita durante o período de carência.
              </p>
            </div>

            <div className="bg-xnema-surface rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">1. Adesão e Período de Carência</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Ao se cadastrar como criador, o usuário terá <strong className="text-xnema-orange">3 meses gratuitos</strong> de acesso à plataforma para postagem de conteúdos.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Durante esse período, não há cobrança de mensalidade ou taxas sobre a receita gerada.
              </p>
            </div>

            <div className="bg-xnema-surface rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">2. Mensalidade e Limite de Espaço</h2>
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/30 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-red-400 mb-3">Após o 4º Mês</h3>
                  <div className="text-4xl font-bold text-red-400 mb-2">R$ 1.000</div>
                  <p className="text-muted-foreground">
                    Mensalidade fixa para manutenção do acesso e hospedagem de vídeos.
                  </p>
                </div>
                
                <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-blue-400 mb-3">Limite de Armazenamento</h3>
                  <div className="text-4xl font-bold text-blue-400 mb-2">100GB</div>
                  <p className="text-muted-foreground">
                    Espaço incluído. Uso adicional será cobrado proporcionalmente.
                  </p>
                </div>
              </div>

              <p className="text-muted-foreground leading-relaxed">
                Cada criador possui um limite de <strong className="text-blue-400">100GB de armazenamento</strong>. 
                Caso esse limite seja ultrapassado, será cobrado um valor proporcional pelo espaço adicional utilizado.
              </p>
            </div>

            <div className="bg-xnema-surface rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">3. Divisão de Receita</h2>
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-green-400 mb-3">Primeiros 3 Meses</h3>
                  <div className="text-4xl font-bold text-green-400 mb-2">100%</div>
                  <p className="text-muted-foreground">
                    <strong>100% da receita gerada pelo conteúdo é do criador.</strong>
                  </p>
                </div>
                
                <div className="bg-gradient-to-br from-xnema-orange/20 to-xnema-purple/20 border border-xnema-orange/30 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-xnema-orange mb-3">A partir do 4º Mês</h3>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl font-bold text-xnema-orange">70%</span>
                    <span className="text-lg text-gray-400">|</span>
                    <span className="text-2xl font-bold text-gray-400">30%</span>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    <span className="text-xnema-orange">O criador recebe 70%</span> da receita gerada.<br/>
                    <span className="text-gray-400">O Cinexnema retém 30%</span> para cobertura de hospedagem, streaming, suporte e infraestrutura.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-xnema-surface rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">4. Formas de Monetização</h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-xnema-orange/10 border border-xnema-orange/20 rounded-lg">
                  <div className="w-2 h-2 bg-xnema-orange rounded-full mt-2"></div>
                  <div>
                    <h3 className="font-semibold text-xnema-orange mb-2">Assinaturas Premium</h3>
                    <p className="text-muted-foreground">
                      Parte da receita das assinaturas é atribuída proporcionalmente ao conteúdo do criador.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-xnema-purple/10 border border-xnema-purple/20 rounded-lg">
                  <div className="w-2 h-2 bg-xnema-purple rounded-full mt-2"></div>
                  <div>
                    <h3 className="font-semibold text-xnema-purple mb-2">Visualizações</h3>
                    <p className="text-muted-foreground">
                      Receita baseada no número de acessos aos conteúdos publicados pelo criador.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-xnema-surface rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">5. Painel do Criador</h2>
              
              <p className="text-muted-foreground leading-relaxed mb-6">
                Os criadores têm acesso a um painel exclusivo com:
              </p>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-400 mb-2">💰</div>
                  <h3 className="font-semibold text-green-400">Ganhos Acumulados</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Acompanhe sua receita em tempo real
                  </p>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-400 mb-2">📊</div>
                  <h3 className="font-semibold text-blue-400">Métricas de Visualização</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Analytics detalhados e cliques
                  </p>
                </div>

                <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-400 mb-2">💳</div>
                  <h3 className="font-semibold text-purple-400">Histórico de Pagamentos</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Comissões e repasses realizados
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-xnema-surface rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">6. Obrigações do Criador</h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-2"></div>
                  <p className="text-muted-foreground">
                    O criador deve respeitar as leis de direitos autorais e as políticas do Cinexnema.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-2"></div>
                  <p className="text-muted-foreground">
                    Conteúdos impróprios ou ilegais podem ser removidos, e o acesso do criador suspenso.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-xnema-surface rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">7. Disposições Gerais</h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>
                  <p className="text-muted-foreground">
                    O Cinexnema se reserva o direito de atualizar estes termos, notificando os criadores sobre alterações relevantes.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>
                  <p className="text-muted-foreground">
                    O uso da plataforma implica concordância com todos os termos acima.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-xnema-surface rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">8. Contato e Suporte</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Para dúvidas específicas sobre estes termos ou para se candidatar como criador:
              </p>
              <ul className="text-muted-foreground space-y-2">
                <li>• <strong>WhatsApp:</strong> (15) 99763-6161</li>
                <li>• <strong>Email:</strong> cinexnema@gmail.com</li>
                <li>• <strong>Assunto:</strong> "Candidatura Criador"</li>
                <li>• <strong>Horário:</strong> Segunda a sexta, 9h às 18h</li>
              </ul>
            </div>
          </div>

          {/* Call to Action */}
          <div className="mt-12 p-8 bg-gradient-to-r from-xnema-orange/20 to-xnema-purple/20 border border-xnema-orange/30 rounded-2xl text-center">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Comece sua Jornada como Criador
            </h3>
            <p className="text-lg text-muted-foreground mb-6">
              3 meses gratuitos + 100% da receita no período de carência
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-xnema-orange hover:bg-xnema-orange/90 text-black font-semibold"
                asChild
              >
                <a href="https://wa.me/5515997636161" target="_blank" rel="noopener noreferrer">
                  Candidatar-se via WhatsApp
                </a>
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-xnema-purple text-xnema-purple hover:bg-xnema-purple hover:text-black font-semibold"
                asChild
              >
                <Link to="/creator-login">
                  Portal do Criador
                </Link>
              </Button>
            </div>
          </div>

          {/* Links relacionados */}
          <div className="mt-12 p-6 bg-xnema-surface rounded-2xl">
            <h3 className="text-xl font-bold text-foreground mb-4">Documentos Relacionados</h3>
            <div className="flex flex-wrap gap-4">
              <Button variant="outline" className="border-xnema-orange text-xnema-orange hover:bg-xnema-orange hover:text-black" asChild>
                <Link to="/terms-of-service">
                  Termos de Uso Gerais
                </Link>
              </Button>
              <Button variant="outline" className="border-xnema-purple text-xnema-purple hover:bg-xnema-purple hover:text-black" asChild>
                <Link to="/privacy-policy">
                  Política de Privacidade
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
