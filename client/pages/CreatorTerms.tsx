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
                Termos para Criadores
              </h1>
            </div>
            
            <p className="text-lg text-muted-foreground">
              Última atualização: {new Date().toLocaleDateString('pt-BR')}
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-invert max-w-none">
            <div className="bg-gradient-to-r from-xnema-orange/20 to-xnema-purple/20 border border-xnema-orange/30 rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">🎉 Oferta Especial de Lançamento</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                <span className="text-xnema-orange font-bold">100% da receita para você nos primeiros 3 meses!</span><br/>
                Aproveite nosso período promocional e comece a gerar renda imediatamente, sem taxas da plataforma.
              </p>
            </div>

            <div className="bg-xnema-surface rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">1. Aceitação dos Termos</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Ao se cadastrar como criador na XNEMA, você aceita estar vinculado a estes Termos para Criadores, 
                além dos Termos de Uso gerais da plataforma.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Estes termos estabelecem os direitos e responsabilidades específicas para criadores de conteúdo 
                que desejam monetizar seu trabalho através da nossa plataforma.
              </p>
            </div>

            <div className="bg-xnema-surface rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">2. Processo de Cadastro</h2>
              
              <h3 className="text-lg font-semibold text-xnema-orange mb-3">2.1 Solicitação</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Para se tornar um criador XNEMA, você deve:
              </p>
              <ul className="text-muted-foreground space-y-2 mb-4">
                <li>• Entrar em contato via WhatsApp (15) 99763-6161 ou email cinexnema@gmail.com</li>
                <li>• Fornecer portfólio ou exemplos do seu trabalho</li>
                <li>• Demonstrar capacidade técnica para produção de conteúdo</li>
                <li>• Ser maior de 18 anos ou representado legalmente</li>
              </ul>

              <h3 className="text-lg font-semibold text-xnema-orange mb-3">2.2 Análise e Aprovação</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Nossa equipe analisará sua solicitação considerando:
              </p>
              <ul className="text-muted-foreground space-y-2">
                <li>• Qualidade do conteúdo apresentado</li>
                <li>• Adequação ao perfil da plataforma</li>
                <li>• Originalidade e criatividade</li>
                <li>• Potencial de engajamento</li>
                <li>• Processo leva até 5 dias úteis</li>
              </ul>
            </div>

            <div className="bg-xnema-surface rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">3. Divisão de Receita</h2>
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-yellow-400 mb-3">Primeiros 3 Meses</h3>
                  <div className="text-4xl font-bold text-yellow-400 mb-2">100%</div>
                  <p className="text-muted-foreground">
                    Toda a receita gerada pelo seu conteúdo é sua. 
                    Zero taxas da plataforma durante o período promocional.
                  </p>
                </div>
                
                <div className="bg-gradient-to-br from-xnema-orange/20 to-xnema-purple/20 border border-xnema-orange/30 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-xnema-orange mb-3">Após 3º Mês</h3>
                  <div className="text-4xl font-bold text-xnema-orange mb-2">70%</div>
                  <p className="text-muted-foreground">
                    Você mantém 70% da receita. Nossa comissão de 30% cobre 
                    hospedagem, streaming, suporte e infraestrutura.
                  </p>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-xnema-orange mb-3">3.1 Formas de Monetização</h3>
              <ul className="text-muted-foreground space-y-2">
                <li>• <strong>Visualizações:</strong> Receita baseada no número de visualizações do seu conteúdo</li>
                <li>• <strong>Assinaturas Premium:</strong> Participação na receita de assinantes que consomem seu conteúdo</li>
                <li>• <strong>Conteúdo Exclusivo:</strong> Monetização adicional para conteúdo premium ou antecipado</li>
              </ul>
            </div>

            <div className="bg-xnema-surface rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">4. Direitos e Obrigações do Criador</h2>
              
              <h3 className="text-lg font-semibold text-xnema-orange mb-3">4.1 Seus Direitos</h3>
              <ul className="text-muted-foreground space-y-2 mb-4">
                <li>• Manter a propriedade intelectual do seu conteúdo original</li>
                <li>• Receber 70% da receita gerada (100% nos primeiros 3 meses)</li>
                <li>• Acesso a analytics detalhados do seu conteúdo</li>
                <li>• Suporte técnico dedicado para criadores</li>
                <li>• Liberdade criativa dentro das diretrizes da plataforma</li>
              </ul>

              <h3 className="text-lg font-semibold text-xnema-orange mb-3">4.2 Suas Obrigações</h3>
              <ul className="text-muted-foreground space-y-2">
                <li>• Produzir conteúdo original e de qualidade</li>
                <li>• Respeitar direitos autorais de terceiros</li>
                <li>• Seguir as diretrizes de conteúdo da XNEMA</li>
                <li>• Fornecer metadados precisos (títulos, descrições, tags)</li>
                <li>• Manter comunicação regular com a equipe XNEMA</li>
                <li>• Não publicar o mesmo conteúdo em plataformas concorrentes por 30 dias</li>
              </ul>
            </div>

            <div className="bg-xnema-surface rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">5. Diretrizes de Conteúdo</h2>
              
              <h3 className="text-lg font-semibold text-xnema-orange mb-3">5.1 Conteúdo Permitido</h3>
              <ul className="text-muted-foreground space-y-2 mb-4">
                <li>• Filmes originais e independentes</li>
                <li>• Séries e documentários autorais</li>
                <li>• Conteúdo educativo e cultural</li>
                <li>• Entretenimento familiar</li>
                <li>• Arte e expressão criativa</li>
              </ul>

              <h3 className="text-lg font-semibold text-xnema-orange mb-3">5.2 Conteúdo Proibido</h3>
              <ul className="text-muted-foreground space-y-2 mb-4">
                <li>• Conteúdo que viole direitos autorais</li>
                <li>• Material pornográfico ou sexualmente explícito</li>
                <li>• Incitação à violência ou ódio</li>
                <li>• Conteúdo discriminatório</li>
                <li>• Informações falsas ou enganosas</li>
                <li>• Atividades ilegais</li>
              </ul>

              <h3 className="text-lg font-semibold text-xnema-orange mb-3">5.3 Padrões Técnicos</h3>
              <ul className="text-muted-foreground space-y-2">
                <li>• Resolu��ão mínima: 1080p (recomendado 4K)</li>
                <li>• Formatos aceitos: MP4, MOV, AVI</li>
                <li>• Áudio: AAC ou MP3, estéreo ou 5.1</li>
                <li>• Duração: sem limitações específicas</li>
                <li>• Thumbnails: 1920x1080, formato JPG ou PNG</li>
              </ul>
            </div>

            <div className="bg-xnema-surface rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">6. Pagamentos e Repasses</h2>
              
              <h3 className="text-lg font-semibold text-xnema-orange mb-3">6.1 Frequência</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Os pagamentos são realizados mensalmente, até o dia 15 do mês seguinte ao período de apuração.
              </p>

              <h3 className="text-lg font-semibold text-xnema-orange mb-3">6.2 Valor Mínimo</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Valor mínimo para saque: R$ 50,00. Valores abaixo são acumulados para o próximo período.
              </p>

              <h3 className="text-lg font-semibold text-xnema-orange mb-3">6.3 Formas de Pagamento</h3>
              <ul className="text-muted-foreground space-y-2 mb-4">
                <li>• PIX (processamento instantâneo)</li>
                <li>• Transferência bancária (1-2 dias úteis)</li>
                <li>• Conta Mercado Pago</li>
              </ul>

              <h3 className="text-lg font-semibold text-xnema-orange mb-3">6.4 Documentação Fiscal</h3>
              <p className="text-muted-foreground leading-relaxed">
                O criador é responsável por emitir nota fiscal ou recibo de pagamento autônomo (RPA) 
                quando solicitado, conforme legislação vigente.
              </p>
            </div>

            <div className="bg-xnema-surface rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">7. Propriedade Intelectual</h2>
              
              <h3 className="text-lg font-semibold text-xnema-orange mb-3">7.1 Seus Direitos</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Você mantém todos os direitos autorais sobre seu conteúdo original. 
                A XNEMA recebe apenas uma licença não exclusiva para exibir, distribuir e promover seu conteúdo.
              </p>

              <h3 className="text-lg font-semibold text-xnema-orange mb-3">7.2 Licença Concedida à XNEMA</h3>
              <ul className="text-muted-foreground space-y-2 mb-4">
                <li>• Exibir o conteúdo na plataforma</li>
                <li>• Criar materiais promocionais</li>
                <li>• Adaptar formatos para diferentes dispositivos</li>
                <li>• Usar em campanhas de marketing da XNEMA</li>
              </ul>

              <h3 className="text-lg font-semibold text-xnema-orange mb-3">7.3 Proteção Contra Pirataria</h3>
              <p className="text-muted-foreground leading-relaxed">
                A XNEMA implementa tecnologias DRM e outras medidas de proteção para 
                prevenir distribuição não autorizada do seu conteúdo.
              </p>
            </div>

            <div className="bg-xnema-surface rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">8. Exclusividade e Concorrência</h2>
              
              <h3 className="text-lg font-semibold text-xnema-orange mb-3">8.1 Período de Exclusividade</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Novos conteúdos devem permanecer exclusivos na XNEMA por 30 dias antes de serem 
                publicados em outras plataformas de streaming.
              </p>

              <h3 className="text-lg font-semibold text-xnema-orange mb-3">8.2 Exceções</h3>
              <ul className="text-muted-foreground space-y-2">
                <li>• Redes sociais para divulgação (teasers de até 2 minutos)</li>
                <li>• Festivais de cinema e eventos culturais</li>
                <li>• Sessões presenciais e cinema tradicional</li>
              </ul>
            </div>

            <div className="bg-xnema-surface rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">9. Suporte e Recursos</h2>
              
              <h3 className="text-lg font-semibold text-xnema-orange mb-3">9.1 Suporte Técnico</h3>
              <ul className="text-muted-foreground space-y-2 mb-4">
                <li>• Ajuda com upload e publicação de conteúdo</li>
                <li>• Otimização de qualidade de vídeo</li>
                <li>• Resolução de problemas técnicos</li>
                <li>• Treinamento em ferramentas da plataforma</li>
              </ul>

              <h3 className="text-lg font-semibold text-xnema-orange mb-3">9.2 Analytics e Relatórios</h3>
              <ul className="text-muted-foreground space-y-2 mb-4">
                <li>• Dashboard detalhado de performance</li>
                <li>• Métricas de visualização em tempo real</li>
                <li>• Dados demográficos da audiência</li>
                <li>• Relatórios de receita e pagamentos</li>
              </ul>

              <h3 className="text-lg font-semibold text-xnema-orange mb-3">9.3 Promoção</h3>
              <ul className="text-muted-foreground space-y-2">
                <li>• Destaque na página inicial da plataforma</li>
                <li>• Inclusão em newsletters e campanhas</li>
                <li>• Promoção em redes sociais da XNEMA</li>
                <li>• Participação em eventos e festivais</li>
              </ul>
            </div>

            <div className="bg-xnema-surface rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">10. Rescisão e Cancelamento</h2>
              
              <h3 className="text-lg font-semibold text-xnema-orange mb-3">10.1 Por Parte do Criador</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Você pode encerrar sua participação como criador a qualquer momento com aviso de 30 dias. 
                Conteúdos já publicados podem permanecer na plataforma por até 90 dias.
              </p>

              <h3 className="text-lg font-semibold text-xnema-orange mb-3">10.2 Por Parte da XNEMA</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Podemos encerrar a parceria em casos de:
              </p>
              <ul className="text-muted-foreground space-y-2 mb-4">
                <li>• Violação destes termos</li>
                <li>• Conteúdo inadequado ou ilegal</li>
                <li>• Inatividade prolongada (mais de 6 meses)</li>
                <li>• Práticas prejudiciais à plataforma</li>
              </ul>

              <h3 className="text-lg font-semibold text-xnema-orange mb-3">10.3 Pagamentos Pendentes</h3>
              <p className="text-muted-foreground leading-relaxed">
                Valores devidos até a data de rescisão serão pagos conforme cronograma normal.
              </p>
            </div>

            <div className="bg-xnema-surface rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">11. Contato e Suporte</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Para dúvidas específicas sobre estes termos ou suporte para criadores:
              </p>
              <ul className="text-muted-foreground space-y-2">
                <li>• <strong>WhatsApp:</strong> (15) 99763-6161</li>
                <li>• <strong>Email:</strong> cinexnema@gmail.com</li>
                <li>• <strong>Assunto:</strong> "Suporte Criador"</li>
                <li>• <strong>Horário:</strong> Segunda a sexta, 9h às 18h</li>
              </ul>
            </div>
          </div>

          {/* Call to Action */}
          <div className="mt-12 p-8 bg-gradient-to-r from-xnema-orange/20 to-xnema-purple/20 border border-xnema-orange/30 rounded-2xl text-center">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Pronto para Começar?
            </h3>
            <p className="text-lg text-muted-foreground mb-6">
              Junte-se aos criadores que já estão monetizando seu talento na XNEMA
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-xnema-orange hover:bg-xnema-orange/90 text-black font-semibold"
                asChild
              >
                <a href="https://wa.me/5515997636161" target="_blank" rel="noopener noreferrer">
                  Falar no WhatsApp
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
