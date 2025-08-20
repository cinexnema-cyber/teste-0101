import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Play, 
  Star, 
  Calendar, 
  Clock, 
  Eye, 
  Heart, 
  Share2, 
  Plus,
  Download,
  Users,
  Award,
  ArrowLeft,
  Lock,
  Crown
} from "lucide-react";

interface SeriesDetails {
  id: string;
  title: string;
  description: string;
  fullStory: string;
  genre: string;
  rating: number;
  seasons: number;
  totalEpisodes: number;
  releaseYear: number;
  status: string;
  image: string;
  trailerUrl: string;
  director: string;
  cast: string[];
  awards: string[];
  isExclusive: boolean;
  isPremium: boolean;
  views: number;
  likes: number;
}

interface Season {
  number: number;
  title: string;
  episodes: Episode[];
  releaseDate: string;
  description: string;
}

interface Episode {
  id: string;
  number: number;
  title: string;
  description: string;
  duration: string;
  thumbnail: string;
  releaseDate: string;
  isAvailable: boolean;
}

export default function SeriesDetail() {
  const { seriesId } = useParams<{ seriesId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState(1);

  // Dados simulados da série (em produção, viria da API)
  const [series, setSeries] = useState<SeriesDetails>({
    id: seriesId || "1",
    title: "Between Heaven and Hell",
    description: "Uma saga épica que explora os limites entre o bem e o mal, onde anjos e demônios coexistem em um mundo moderno.",
    fullStory: "Em um mundo onde as fronteiras entre o sagrado e o profano se tornam cada vez mais tênues, 'Between Heaven and Hell' nos apresenta a Gabriel Santos, um ex-padre que abandonou a batina após questionar sua fé. Sua vida pacata é virada de cabeça para baixo quando ele descobre possuir poderes angelicais latentes, herdados de uma linhagem ancestral que ele desconhecia. Paralelamente, conhecemos Lilith Morgenstern, uma demônia de alto escalão que, cansada da eterna guerra entre bem e mal, busca uma forma de encontrar paz e, quem sabe, redenção. O destino une esses dois seres improváveis quando uma antiga profecia revela que apenas juntos eles podem impedir o Apocalipse Final - uma batalha que não apenas destruiria a Terra, mas redesenharia completamente a hierarquia celestial e infernal.",
    genre: "Drama Sobrenatural",
    rating: 4.9,
    seasons: 7,
    totalEpisodes: 84,
    releaseYear: 2025,
    status: "Em Produção",
    image: "https://cdn.builder.io/api/v1/image/assets%2Ff280dc7f1a3b442bb1f2a4e0b57c6521%2F53ce9d12d034482db26dcf63073a2cfe?format=webp&width=600",
    trailerUrl: "https://www.youtube.com/embed/-KmVyIbsV0Y",
    director: "Iarima Temiski",
    cast: [
      "Alexandra Stone como Lilith Morgenstern",
      "Marcus Rivera como Gabriel Santos", 
      "Elena Vasquez como Sarah Chen",
      "David Chen como Michael Thompson",
      "Sofia Reyes como Maria Santos",
      "James Wilson como Padre Anthony"
    ],
    awards: [
      "Melhor Série de Drama - Festival de Cannes 2024",
      "Melhor Efeitos Visuais - Emmy Latino 2024",
      "Melhor Trilha Sonora - Prêmio da Crítica 2024"
    ],
    isExclusive: true,
    isPremium: true,
    views: 2100000,
    likes: 89320
  });

  const [seasons, setSeasons] = useState<Season[]>([
    {
      number: 1,
      title: "O Despertar",
      releaseDate: "2025-01-15",
      description: "Gabriel descobre seus poderes angelicais enquanto Lilith questiona seu lugar no inferno.",
      episodes: [
        {
          id: "s1e1",
          number: 1,
          title: "A Revelação",
          description: "Gabriel Santos, ex-padre, descobre poderes sobrenaturais após um encontro misterioso.",
          duration: "47min",
          thumbnail: "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=300&h=200&fit=crop",
          releaseDate: "2025-01-15",
          isAvailable: true
        },
        {
          id: "s1e2", 
          number: 2,
          title: "Primeira Tentação",
          description: "Lilith aparece pela primeira vez, testando Gabriel e revelando a natureza de sua missão.",
          duration: "45min",
          thumbnail: "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=300&h=200&fit=crop",
          releaseDate: "2025-01-22",
          isAvailable: true
        },
        {
          id: "s1e3",
          number: 3,
          title: "Aliança Improvável",
          description: "Gabriel e Lilith são forçados a trabalhar juntos quando uma ameaça maior surge.",
          duration: "46min",
          thumbnail: "https://images.unsplash.com/photo-1535016120720-40c646be5580?w=300&h=200&fit=crop",
          releaseDate: "2025-01-29",
          isAvailable: true
        },
        {
          id: "s1e4",
          number: 4,
          title: "O Passado Revelado",
          description: "Flashbacks revelam a origem dos poderes de Gabriel e o passado de Lilith.",
          duration: "48min",
          thumbnail: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=300&h=200&fit=crop",
          releaseDate: "2025-02-05",
          isAvailable: false
        }
      ]
    },
    {
      number: 2,
      title: "A Profecia",
      releaseDate: "2025-06-15",
      description: "A antiga profecia é revelada, mudando o destino de Gabriel e Lilith para sempre.",
      episodes: [
        {
          id: "s2e1",
          number: 1,
          title: "Novo Começo",
          description: "Após os eventos da primeira temporada, Gabriel e Lilith enfrentam as consequências.",
          duration: "49min",
          thumbnail: "https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=300&h=200&fit=crop",
          releaseDate: "2025-06-15",
          isAvailable: false
        }
      ]
    }
  ]);

  const isSubscriber = user?.role === "subscriber" || user?.role === "admin";

  const formatViews = (views: number) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };

  const handleWatchEpisode = (episodeId: string) => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (!isSubscriber) {
      navigate("/premium");
      return;
    }

    navigate(`/watch/${episodeId}`);
  };

  const handleWatchTrailer = () => {
    // Abrir trailer em modal ou nova aba
    window.open(series.trailerUrl, '_blank');
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: series.title,
        text: series.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-xnema-dark text-white">
        {/* Hero Section */}
        <div className="relative">
          {/* Background Image */}
          <div
            className="h-[70vh] bg-cover bg-center relative"
            style={{
              backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.8)), url(${series.image})`
            }}
          >
            {/* Back Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="absolute top-6 left-6 text-white hover:text-xnema-orange bg-black/50 hover:bg-black/70"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Voltar
            </Button>

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <div className="max-w-4xl">
                <div className="flex items-center gap-4 mb-4">
                  <h1 className="text-5xl font-bold">{series.title}</h1>
                  {series.isExclusive && (
                    <Badge className="bg-xnema-orange text-white text-lg px-3 py-1">
                      EXCLUSIVO
                    </Badge>
                  )}
                  {series.isPremium && (
                    <Badge className="bg-xnema-purple text-white text-lg px-3 py-1">
                      PREMIUM
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-6 text-lg mb-6">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                    <span className="font-semibold">{series.rating}</span>
                  </div>
                  <span>{series.genre}</span>
                  <span>{series.releaseYear}</span>
                  <span>{series.seasons} temporadas</span>
                  <span>{series.totalEpisodes} episódios</span>
                  <Badge variant="secondary">{series.status}</Badge>
                </div>

                <p className="text-xl text-gray-200 mb-8 max-w-3xl leading-relaxed">
                  {series.description}
                </p>

                <div className="flex items-center gap-4">
                  {isSubscriber ? (
                    <Button
                      size="lg"
                      className="bg-xnema-orange hover:bg-xnema-orange/90 text-lg px-8 py-3"
                      onClick={() => handleWatchEpisode("s1e1")}
                    >
                      <Play className="w-6 h-6 mr-2" />
                      Assistir Agora
                    </Button>
                  ) : (
                    <Button
                      size="lg"
                      className="bg-xnema-orange hover:bg-xnema-orange/90 text-lg px-8 py-3"
                      asChild
                    >
                      <Link to="/premium">
                        <div className="flex items-center">
                          <Crown className="w-6 h-6 mr-2" />
                          Assinar para Assistir
                        </div>
                      </Link>
                    </Button>
                  )}

                  <Button
                    size="lg"
                    variant="outline"
                    className="text-lg px-8 py-3"
                    onClick={handleWatchTrailer}
                  >
                    <Play className="w-6 h-6 mr-2" />
                    Trailer
                  </Button>

                  <Button
                    size="lg"
                    variant="outline"
                    onClick={handleLike}
                    className={`text-lg px-6 py-3 ${isLiked ? 'bg-red-500 text-white' : ''}`}
                  >
                    <Heart className={`w-6 h-6 mr-2 ${isLiked ? 'fill-current' : ''}`} />
                    {formatViews(series.likes)}
                  </Button>

                  <Button size="lg" variant="outline" onClick={handleShare} className="text-lg px-6 py-3">
                    <Share2 className="w-6 h-6" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-8 py-12">
          <Tabs defaultValue="episodes" className="space-y-8">
            <TabsList className="grid w-full grid-cols-4 max-w-md">
              <TabsTrigger value="episodes">Episódios</TabsTrigger>
              <TabsTrigger value="details">Detalhes</TabsTrigger>
              <TabsTrigger value="cast">Elenco</TabsTrigger>
              <TabsTrigger value="awards">Prêmios</TabsTrigger>
            </TabsList>

            {/* Episodes Tab */}
            <TabsContent value="episodes" className="space-y-6">
              {/* Season Selector */}
              <div className="flex items-center gap-4 mb-6">
                <h2 className="text-2xl font-bold">Episódios</h2>
                <div className="flex gap-2">
                  {seasons.map((season) => (
                    <Button
                      key={season.number}
                      variant={selectedSeason === season.number ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedSeason(season.number)}
                      className={selectedSeason === season.number ? "bg-xnema-orange" : ""}
                    >
                      Temporada {season.number}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Season Info */}
              {seasons.find(s => s.number === selectedSeason) && (
                <Card className="bg-xnema-surface border-gray-700 mb-6">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-2">
                      Temporada {selectedSeason}: {seasons.find(s => s.number === selectedSeason)?.title}
                    </h3>
                    <p className="text-gray-300 mb-4">
                      {seasons.find(s => s.number === selectedSeason)?.description}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span>Lançamento: {seasons.find(s => s.number === selectedSeason)?.releaseDate}</span>
                      <span>{seasons.find(s => s.number === selectedSeason)?.episodes.length} episódios</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Episodes List */}
              <div className="grid gap-4">
                {seasons.find(s => s.number === selectedSeason)?.episodes.map((episode) => (
                  <Card key={episode.id} className="bg-xnema-surface border-gray-700">
                    <CardContent className="p-0">
                      <div className="flex gap-4 p-4">
                        {/* Episode Thumbnail */}
                        <div className="relative w-48 h-28 flex-shrink-0">
                          <div
                            className="w-full h-full bg-cover bg-center rounded-lg"
                            style={{ backgroundImage: `url(${episode.thumbnail})` }}
                          />
                          {!episode.isAvailable && (
                            <div className="absolute inset-0 bg-black/70 rounded-lg flex items-center justify-center">
                              <Lock className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                          {episode.isAvailable && isSubscriber && (
                            <Button
                              size="sm"
                              className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-black/70 hover:bg-xnema-orange"
                              onClick={() => handleWatchEpisode(episode.id)}
                            >
                              <Play className="w-6 h-6" />
                            </Button>
                          )}
                        </div>

                        {/* Episode Info */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="text-lg font-semibold">
                              {episode.number}. {episode.title}
                            </h4>
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                              <Clock className="w-4 h-4" />
                              <span>{episode.duration}</span>
                            </div>
                          </div>

                          <p className="text-gray-300 mb-4 leading-relaxed">
                            {episode.description}
                          </p>

                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-400">
                              Lançamento: {episode.releaseDate}
                            </span>

                            {episode.isAvailable ? (
                              isSubscriber ? (
                                <Button
                                  size="sm"
                                  className="bg-xnema-orange hover:bg-xnema-orange/90"
                                  onClick={() => handleWatchEpisode(episode.id)}
                                >
                                  <Play className="w-4 h-4 mr-2" />
                                  Assistir
                                </Button>
                              ) : (
                                <Button size="sm" variant="outline" asChild>
                                  <Link to="/premium">
                                    <div className="flex items-center">
                                      <Crown className="w-4 h-4 mr-2" />
                                      Assinar
                                    </div>
                                  </Link>
                                </Button>
                              )
                            ) : (
                              <Badge variant="secondary">Em Breve</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Details Tab */}
            <TabsContent value="details" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-xnema-orange">História Completa</h3>
                  <div className="text-gray-300 leading-relaxed">
                    <p className="mb-4">
                      <strong>Between Heaven and Hell</strong>{" "}
                      – Em um mundo onde a linha entre o céu e o inferno é
                      tênue, cada escolha tem consequências devastadoras.
                      Quando forças celestiais e demoníacas entram em
                      conflito pelo destino da humanidade, um indivíduo
                      comum se vê arrastado para uma batalha que desafia
                      tudo o que ele conhece sobre moralidade, fé e
                      coragem. Entre encontros com seres sobrenaturais,
                      traições inesperadas e decisões impossíveis, ele
                      precisará enfrentar seus maiores medos e descobrir
                      até onde está disposto a ir para proteger aqueles
                      que ama.
                    </p>
                    <p>
                      Com cenas de ação arrebatadoras, efeitos visuais
                      impressionantes e uma narrativa intensa,{" "}
                      <strong>Between Heaven and Hell</strong>{" "}
                      mergulha o espectador em uma aventura épica que
                      questiona os limites entre o bem e o mal. Cada
                      capítulo revela segredos sombrios, alianças
                      inesperadas e dilemas morais que fazem o público
                      refletir sobre seus próprios valores. Uma obra que
                      combina drama, suspense e fantasia de forma única,
                      levando a uma experiência cinematográfica
                      inesquecível.
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-xnema-orange mb-2">Informações da Série</h4>
                    <div className="space-y-2 text-gray-300">
                      <div className="flex justify-between">
                        <span>Gênero:</span>
                        <span>{series.genre}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Ano de Lançamento:</span>
                        <span>{series.releaseYear}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <Badge variant="secondary">{series.status}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Total de Temporadas:</span>
                        <span>{series.seasons}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total de Episódios:</span>
                        <span>{series.totalEpisodes}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Visualizações:</span>
                        <span>{formatViews(series.views)}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-xnema-orange mb-2">Direção</h4>
                    <p className="text-gray-300">{series.director}</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Cast Tab */}
            <TabsContent value="cast" className="space-y-6">
              <h3 className="text-xl font-semibold text-xnema-orange">Elenco Principal</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {series.cast.map((actor, index) => (
                  <Card key={index} className="bg-xnema-surface border-gray-700">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-xnema-orange to-xnema-purple rounded-full flex items-center justify-center">
                          <Users className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-medium text-white">{actor}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Awards Tab */}
            <TabsContent value="awards" className="space-y-6">
              <h3 className="text-xl font-semibold text-xnema-orange">Prêmios e Reconhecimentos</h3>
              <div className="grid gap-4">
                {series.awards.map((award, index) => (
                  <Card key={index} className="bg-xnema-surface border-gray-700">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                          <Award className="w-6 h-6 text-white" />
                        </div>
                        <p className="font-medium text-white">{award}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}
